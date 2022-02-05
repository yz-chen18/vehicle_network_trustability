class CarNode {
    constructor(id, trust_value, insert_time, decay_param = null) {
        this.id = id;
        this.trust_value = trust_value;
        this.insert_time = insert_time;
        this.timer = null;
        this.decay_param = decay_param;
        this.subchain = null;
        this.next = null;
    }

    trust_decay() {
        this.trust_value = this.trust_value * this.decay_param;
        console.warn('trust_decay', this.id, this.trust_value);
        return this.trust_value;
    }

}