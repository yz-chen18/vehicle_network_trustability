class CarLinkList {
    constructor(id, trust_value) {
        this.head = new CarNode(id, trust_value, new Date().getTime());
        this.tail = this.head;
    }

    lookup_main(id) {
        let head = this.head;
        while (head.next != null) {
            if (head.id === id) {
                return true;
            }
            head = head.next;
        }

        return false;
    }

    insert_node(id, trust_value) {
        console.warn(this.head.id, 'before insert_node', JSON.stringify(this.toString()), 'inserted id:', id);
        let carNode = new CarNode(id, trust_value, new Date().getTime());
        console.warn(this.head.id, 'mid insert_node', JSON.stringify(this.toString()), JSON.stringify(carNode));
        this.tail.next = carNode;
        this.tail = carNode;
        console.warn(this.head.id, 'after insert_node', JSON.stringify(this.toString()), 'inserted id:', id);
    }

    insert_linklist(carLinkList) {
        // 跳过头节点
        let curNode = carLinkList.head.next;
        let subHead = this.tail;

        console.log('CarLinkList.insert_linklist:', carLinkList, curNode);
        if (curNode != null) {
            subHead.subchain = new CarNode(curNode.id, curNode.trust_value, curNode.insert_time);
            subHead = subHead.subchain;
            curNode = curNode.next;
        }

        while (curNode != null) {
            subHead.next = new CarNode(curNode.id, curNode.trust_value, curNode.insert_time);
            subHead = subHead.next;
            curNode = curNode.next;
        }
    }

    remove_from_main_list(id) {
        let head = this.head;
        while (head.next != null) {
            if (head.next.id === id) {
                head.next = head.next.next;
            }
        }
    }

    toString() {
        let head = this.head;
        let s = {};
        while (head.next != null) {
            s[head.next.id] = [];
            let subchain = head.next.subchain;
            console.log('subchain', subchain);
            while (subchain != null) {
                s[head.next.id].push(subchain.id);
                subchain = subchain.next;
            }
            head = head.next
        }

        return s;
    }
}