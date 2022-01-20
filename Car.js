class Car {
    constructor(marker, id, speed, is_trustable=true) {
        this.marker = marker;
        this.id = id;
        this.speed = speed;
        this.infoWindow = null;
        this.untrusted_vehicles = [];
        this.trusted_vehicles = [];
        this.is_trustable = is_trustable;
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
        car.marker.emit('receive', {message: message});
    }

    receive_message(message) {

    }
}