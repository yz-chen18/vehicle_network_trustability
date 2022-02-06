class Car {
    constructor(marker, id, speed, is_trustable=true, needed_amount = 20, trust_thresh = 0.6,
                send_frequency = 5) {
        this.marker = marker;
        this.id = id;
        this.speed = speed;
        this.infoWindow = null;
        this.untrusted_cars = {};
        this.trusted_carLinklist = new CarLinkList(id, this, 1, new Date().getTime());
        this.unlabeled_cars = {};
        this.is_trustable = is_trustable;
        this.needed_amount = needed_amount;
        this.trust_thresh = trust_thresh;
        this.send_frequency = send_frequency;
        this.self_real_num = 0;
        this.self_fake_num = 0;
        this.other_trust_value_buffer = 0.0;
        this.other_selftrust_value_buffer = 0.0;
        this.timer = 0;
    }

    // p for the possibility of generating reliable data, p must gt 0
    generate_data() {
        let p;
        if (this.is_trustable) {
            p = 1;
            // p = Math.random()*0.1 + 0.9;
        } else {
            p = Math.random()*POSSIBILITY_RANGE + MINIMUM_POSSIBILITY;
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
        if (message.data) {
            this.self_real_num += 1;
        } else {
            this.self_fake_num += 1;
        }
        car.marker.emit('receive_data', {message: message, receiver: car, sender: this});
    }

    receive_message(message) {

    }

    // 通过他车发送的信息计算他车的信任值，sender为他车
    calculate_trust_value(message, sender) {
        this.timer += 1;
        if (!(sender.id in this.unlabeled_cars)) {
            this.unlabeled_cars[sender.id] = [0, 0];
        }

        let real_data_num = this.unlabeled_cars[sender.id][1];
        let fake_data_num = this.unlabeled_cars[sender.id][0];

        // 当数据量足以计算信任值且被计算的车辆不在信任链表中
        let res = this.trusted_carLinklist.lookup(sender.id);
        if ((real_data_num + fake_data_num  === this.needed_amount) && (sender.id in this.unlabeled_cars)
            && this.trusted_carLinklist.lookup_main(sender.id) === null) {
            let algo = new TrustValueAlgo(real_data_num, fake_data_num);
            let trust_value = algo.get_trust_value();
            let self_algo = new TrustValueAlgo(this.self_real_num, this.self_fake_num);
            let self_trust_value = self_algo.get_trust_value();
            this.other_trust_value_buffer = trust_value;
            sender.other_selftrust_value_buffer = self_trust_value;

            //todo 存在竞争
            let p = this;
            let token = new Token('calculate_trust_value', new Set([this.marker, sender.marker]),
                [this.id, sender.id].sort());
            let events = [];
            events.push([this.marker, new Event('receive_self_trust_value', {sender: sender, receiver: p})]);
            events.push([sender.marker, new Event('receive_self_trust_value', {sender: p, receiver: sender})]);
            switcher.put(token, events);

        }

        if (sender.id in this.unlabeled_cars) {
            this.unlabeled_cars[sender.id][message.data] += 1;
        }
    }
}