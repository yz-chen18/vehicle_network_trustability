class CarLinkList {
    constructor(id, car, trust_value) {
        // dummy head, 指向自身
        this.head = new CarNode(id, car, trust_value, new Date().getTime());
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
    insert_node(car, trust_value, trust_thresh) {
        // 主链单元信任值需要衰减
        let carNode = new CarNode(car.id, car, trust_value, new Date().getTime(), 0.9, trust_thresh);
        this.tail.next = carNode;
        this.tail = carNode;
        this.retiming(carNode);
    }

    remove_node_from_main(id) {
        let head = this.head;
        console.warn('debug', head, this);
        while (head.next != null) {
            if (head.next.id === id) {
                console.warn('debug', head, this, 'removed id:', id);
                clearTimeout(head.next.timer);
                if (this.tail === head.next) {
                    this.tail = head;
                }
                head.next = head.next.next;
                //todo 向其余节点发送删除的消息通知
                let head = this.head;
                while (head.next != null) {
                    head.next.car.marker.emit('receive_remove_from_sub', {receiver: head.next.car, sender: this.head.car,
                        removed_id: id})
                }
                break;
            }

            head = head.next;
        }
    }

    remove_node_from_sub(main_id, sub_id) {
        let head = this.head;

        while (head.next != null) {
            if (head.next.id === main_id) {
                head = head.next;
                if (head.subchain != null && head.subchain.id === sub_id) {
                    head.subchain = head.subchain.next;
                    break;
                }

                head = head.subchain;
                while (head != null && head.next != null) {
                    if (head.next.id === sub_id) {
                        head.next = head.next.next;
                        break;
                    }

                    head = head.next;
                }
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
            subHead.subchain = new CarNode(curNode.id, curNode.car, curNode.trust_value, curNode.insert_time);
            subHead = subHead.subchain;
            curNode = curNode.next;
        }

        while (curNode != null) {
            subHead.next = new CarNode(curNode.id, curNode.car, curNode.trust_value, curNode.insert_time);
            subHead = subHead.next;
            curNode = curNode.next;
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

        return JSON.stringify(s);
    }

    retiming(carNode) {
        let p = this;
        clearTimeout(carNode.timer);
        carNode.timer = setTimeout(function () {
            let trust_value = carNode.trust_decay();
            if (trust_value > carNode.trust_thresh) {
                p.retiming(carNode);
            } else {
                console.warn(p.head.id, 'before remove node, removed id', carNode.id, p.toString(), p);
                p.remove_node_from_main(carNode.id);
                console.warn(p.head.id, 'after remove node, removed id', carNode.id, p.toString(), p);
            }
        }, 2000);
    }
}