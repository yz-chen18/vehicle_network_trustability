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

    lookup(id) {
        let head = this.head;
        while (head.next != null) {
            if (head.next.id === id) {
                return [CarLinkListPosEnum.MAIN, head.next];
            } else {
                let subchain = head.next.subchain;
                while (subchain != null) {
                    if (subchain.id === id) {
                        return [CarLinkListPosEnum.SUB, subchain];
                    }
                    subchain = subchain.next;
                }
            }
            head = head.next;
        }

        return [CarLinkListPosEnum.NAN, null];
    }



    get_from_main(id) {
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
        let head = this.head;

        while (head.next != null) {
            if (distance(head.next.car.marker.getPosition(), this.head.car.marker.getPosition()) < COMMUNICATION_RANGE) {
                head.next.car.marker.emit('receive_insert_update', {
                    receiver: head.next.car, sender: this.head.car,
                    inserted_car: car, trust_value: trust_value});
            }
            head = head.next;
        }

        let carNode = new CarNode(car.id, car, trust_value, new Date().getTime(), 0.9, trust_thresh);
        this.tail.next = carNode;
        this.tail = carNode;
        this.retiming(carNode);
    }

    // main_car: 需要更新的车辆, sub_car: 被插入的车辆
    insert_sub_node(main_car, sub_car, trust_value) {
        let head = this.head;

        while (head.next != null) {
            if (head.next.id === main_car.id) {
                head = head.next;
                if (head.subchain === null) {
                    head.subchain = new CarNode(sub_car.id, sub_car, trust_value, new Date().getTime());
                } else {
                    head = head.subchain;
                    while (head.next != null) {
                        head = head.next;
                    }
                    head.next = new CarNode(sub_car.id, sub_car, trust_value, new Date().getTime());
                }
                break;
            }

            head = head.next;
        }
    }

    remove_node_from_main(id) {
        let head = this.head;
        while (head.next != null) {
            if (head.next.id === id) {
                clearTimeout(head.next.timer);
                if (this.tail === head.next) {
                    this.tail = head;
                }
                head.next = head.next.next;

                head = this.head;
                while (head.next != null) {
                    // 模拟车辆删除主链单元后向”通信范围内的“其他车辆发出消息通知
                    if (distance(head.next.car.marker.getPosition(), this.head.car.marker.getPosition()) < COMMUNICATION_RANGE) {
                        head.next.car.marker.emit('receive_remove_update', {receiver: head.next.car, sender: this.head.car,
                            removed_id: id})
                    }
                    head = head.next;
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
                    let t = head.subchain;
                    head.subchain = head.subchain.next;
                    return t;
                }

                head = head.subchain;
                while (head != null && head.next != null) {
                    if (head.next.id === sub_id) {
                        let t = head.next;
                        head.next = head.next.next;
                        return t;
                    }

                    head = head.next;
                }
                break;
            }

            head = head.next;
        }

        return null;
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