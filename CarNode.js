class CarNode {
    constructor(id, trust_value, insert_time, decay_param = null, trust_thresh = 0.5) {
        this.id = id;
        this.trust_value = trust_value;
        this.insert_time = insert_time;
        this.timer = null;
        this.decay_param = decay_param;
        this.trust_thresh = trust_thresh;
        this.subchain = null;
        this.next = null;
    }

    trust_decay() {
        this.trust_value = this.trust_value * this.decay_param;
        console.warn('trust_decay', this.id, this.trust_value);
        return this.trust_value;
    }

}