class CarNode {
    constructor(id, trust_value, insert_time) {
        this.id = id;
        this.trust_value = trust_value;
        this.insert_time = insert_time;
        this.subchain = null;
        this.next = null;
    }
}