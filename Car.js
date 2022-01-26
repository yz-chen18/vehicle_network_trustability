class Car {
    constructor(marker, id, speed, is_trustable=true, needed_amount = 20, trust_thresh = 0.6,
                send_frequency = 5) {
        this.marker = marker;
        this.id = id;
        this.speed = speed;
        this.infoWindow = null;
        this.untrusted_cars = {};
        this.trusted_carLinklist = new CarLinkList(id, 1, new Date().getTime());
        this.unlabeled_cars = {};
        this.is_trustable = is_trustable;
        this.needed_amount = needed_amount;
        this.trust_thresh = trust_thresh;
        this.send_frequency = send_frequency;
        this.timer = 0;
        this.sab = new Int32Array(new ArrayBuffer(4));
    }

    // p for the possibility of generating reliable data, p must gt 0
    generate_data() {
        let p;
        if (this.is_trustable) {
            p = 1;
            // p = Math.random()*0.1 + 0.9;
        } else {
            p = Math.random()*0.1 + 0.1;
        }
        let rand = Math.random()/p;
        if (rand <= 1) {
            return 1;
        } else {
            return 0;
        }
    }

    // car为接收方
    send_message(car) {
        let message = new Message(this.id, this.generate_data());
        car.marker.emit('receive_data', {message: message, receiver: car, sender: this});
    }

    receive_message(message) {

    }

    calculate_trust_value(message, sender) {
        this.timer += 1;
        if (!(sender.id in this.unlabeled_cars)) {
            this.unlabeled_cars[sender.id] = [0, 0];
        }

        let real_data_num = this.unlabeled_cars[sender.id][1];
        let fake_data_num = this.unlabeled_cars[sender.id][0];
        if ((real_data_num + fake_data_num  === this.needed_amount) && (sender.id in this.unlabeled_cars)
            && !(this.trusted_carLinklist.lookup_main(sender.id))) {
            delete this.unlabeled_cars[sender.id];
            let algo = new TrustValueAlgo(real_data_num, fake_data_num);
            let trust_value = algo.get_trust_value();
            if (trust_value > this.trust_thresh) {
                //todo 检查执行顺序
                console.warn(this.id, 'before insert_node', this.trusted_carLinklist, JSON.stringify(this.trusted_carLinklist.toString()),
                    'inserted id:', sender.id);
                this.trusted_carLinklist.insert_node(sender.id, trust_value);
                console.warn(this.id, 'after insert_node', this.trusted_carLinklist, JSON.stringify(this.trusted_carLinklist.toString()));
                sender.marker.emit('receive_linklist', {carLinklist: this.trusted_carLinklist, receiver: sender});
            } else {
                this.untrusted_cars[sender.id] = trust_value;
            }
        } else {
            this.unlabeled_cars[sender.id][message.data] += 1;
        }
    }
}