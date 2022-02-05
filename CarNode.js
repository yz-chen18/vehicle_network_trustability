class CarNode {
    constructor(id, trust_value, insert_time, set_timer = false, decay_param = null, time = null) {
        this.id = id;
        this.trust_value = trust_value;
        this.insert_time = insert_time;
        this.decay_param = decay_param;
        this.timer = null;
        this.time = time;
        this.subchain = null;
        this.next = null;

        if (set_timer) {
            console.warn("init");
            let p = this;
            this.timer = setTimeout(function () {
                p.trust_decay();
            }, this.time);
        }
    }

    trust_decay() {
        this.trust_value = this.trust_value * this.decay_param;
        console.warn('decay', 'CarNode id', this.id, 'Timer id', this.timer);
        this.retiming();
        return this.trust_value;
    }

    retiming() {
        if (this.timer != null) {
            console.log("this.timer != null", this.timer);
            clearTimeout(this.timer);
            let p = this;
            this.timer = setTimeout(function () {
                p.trust_decay();
            }, this.time);
        }
    }
}