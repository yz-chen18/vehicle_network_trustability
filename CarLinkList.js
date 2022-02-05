class CarLinkList {
    constructor(id, trust_value) {
        // dummy head, 指向自身
        this.head = new CarNode(id, trust_value, new Date().getTime());
        this.tail = this.head;
    }

    lookup_main(id) {
        let head = this.head;
        while (head.next != null) {
            if (head.next.id === id) {
                return head.next;
            }
            head = head.next;
        }

        return null;
    }

    // 创建主链单元
    insert_node(id, trust_value) {
        // 主链单元信任值需要衰减
        let carNode = new CarNode(id, trust_value, new Date().getTime(), 0.9);
        this.tail.next = carNode;
        this.tail = carNode;
        this.retiming(carNode);
    }

    remove_node(id) {
        let head = this.head;

        while (head.next != null) {
            if (head.next.id === id) {
                clearTimeout(head.next.timer);
                head.next = head.next.next;
                break;
            }

            head = head.next;
        }
    }

    // 创建子链单元
    insert_linklist(carLinkList) {
        // 跳过头节点
        let curNode = carLinkList.head.next;
        let subHead = this.tail;

        //console.log('CarLinkList.insert_linklist:', carLinkList, curNode);
        if (curNode != null) {
            // 子链单元信任值”不“需要衰减
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
            while (subchain != null) {
                s[head.next.id].push(subchain.id);
                subchain = subchain.next;
            }
            head = head.next
        }

        return s;
    }

    retiming(carNode) {
        let p = this;
        clearTimeout(carNode.timer);
        carNode.timer = setTimeout(function () {
            let trust_value = carNode.trust_decay();
            if (trust_value > thresh) {
                p.retiming(carNode);
            } else {
                console.warn(p.head.id, 'before remove node, removed id', carNode.id, JSON.stringify(p.toString()), p);
                p.remove_node(carNode.id);
                console.warn(p.head.id, 'after remove node, removed id', carNode.id, JSON.stringify(p.toString()), p);
            }
        }, 2000);
    }
}