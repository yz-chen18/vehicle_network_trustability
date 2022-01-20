class Car {
    constructor(marker, id, speed, is_trustable=true, needed_amount = 10, trust_thresh = 0.6,
                send_frequency = 100) {
        this.marker = marker;
        this.id = id;
        this.speed = speed;
        this.infoWindow = null;
        this.untrusted_cars = {};
        this.trusted_cars = {};
        this.unlabeled_cars = {};
        this.is_trustable = is_trustable;
        this.needed_amount = needed_amount;
        this.trust_thresh = trust_thresh;
        this.send_frequency = send_frequency;
    }

    // p for the possibility of generating reliable data, p must gt 0
    generate_data() {
        let p;
        if (this.is_trustable) {
            p = Math.random()*0.1 + 0.9;
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

    send_message(car) {
        let message = new Message(this.id, this.generate_data());
        car.marker.emit('receive', {message: message, car: car});
    }

    receive_message(message) {

    }

    calculate_trust_value(id, data) {
        if (!(id in this.unlabeled_cars)) {
            this.unlabeled_cars[id] = [0, 0];
        }
        if (this.unlabeled_cars[id][0] + this.unlabeled_cars[id][1]  === this.needed_amount) {
            let algo = new TrustValueAlgo(this.unlabeled_cars[id][1], this.unlabeled_cars[id][0]);
            let trust_value = algo.get_trust_value();
            if (trust_value > this.trust_thresh) {
                this.trusted_cars[id] = trust_value;
            } else {
                this.untrusted_cars[id] = trust_value;
            }
            delete this.unlabeled_cars[id];
        } else {
            this.unlabeled_cars[id][data] += 1;
        }
    }
}