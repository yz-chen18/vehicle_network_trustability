function receive_data_event_handle(e) {
    //console.log('Events.receive_data_event_handle:', e);
    let carNode = e.receiver.trusted_carLinklist.lookup_main((e.sender.id));
    if (carNode != null) {
        //console.log("trusted::", e.car.trusted_cars[e.message.id]);
        //carNode.retiming();
        e.receiver.trusted_carLinklist.retiming(carNode);
    } else if (e.sender.id in e.receiver.untrusted_cars) {
        //console.log("untrusted::", e.car.untrusted_cars[e.message.id]);
    } else {
        //console.log(e);
        e.receiver.calculate_trust_value(e.message, e.sender);
    }
}

function receive_data_event_handle_new(e) {
    //console.log('Events.receive_data_event_handle:', e);
    let res = e.receiver.trusted_carLinklist.lookup(e.sender.id);
    let carLinkListPos = res[0];
    let carNode = res[1];
    if (carLinkListPos === CarLinkListPosEnum.MAIN) {
        e.receiver.trusted_carLinklist.retiming(carNode);
    } else if (carLinkListPos === CarLinkListPosEnum.SUB) {
        let head = e.receiver.trusted_carLinklist.head;
        let trust_value = 1;
        let tempNode = null;
        let car = null;
        let trust_thresh = 1;
        while (head.next != null) {
            tempNode = e.receiver.trusted_carLinklist.remove_node_from_sub(head.next.id, carNode.id);
            if (tempNode != null) {
                if (car === null) {
                    car = tempNode.car;
                    trust_thresh = tempNode.trust_thresh;
                }
                trust_value = Math.min(trust_value, tempNode.trust_value);
            }
            head = head.next;
        }
        e.receiver.trusted_carLinklist.insert_node(car, trust_value, trust_thresh);
    } else if (e.sender.id in e.receiver.untrusted_cars) {
        // nothing for now
    } else {
        e.receiver.calculate_trust_value(e.message, e.sender);
    }
}

function receive_linklist_event_handle(e) {
    console.warn(e.receiver.id, 'before insert linklist, inserted id', e.sender.id, e.receiver.trusted_carLinklist.toString(), e);
    let carLinklist = e.sender.trusted_carLinklist;
    e.receiver.trusted_carLinklist.insert_linklist(carLinklist)
    console.warn(e.receiver.id, 'after insert linklist, inserted id', e.sender.id, e.receiver.trusted_carLinklist.toString(), e);
}

function receive_self_trust_value_handle(e) {
    let sender = e.sender;
    let receiver = e.receiver;
    let trust_value = Math.min(receiver.other_selftrust_value_buffer, receiver.other_trust_value_buffer);

    if (trust_value > receiver.trust_thresh) {
        console.warn(receiver.id, 'before insert_node', receiver.trusted_carLinklist,
            receiver.trusted_carLinklist.toString(), 'inserted id:', sender.id, 'trust value:', trust_value);
        receiver.trusted_carLinklist.insert_node(sender, trust_value, receiver.trust_thresh);
        console.warn(receiver.id, 'after insert_node', receiver.trusted_carLinklist,
            receiver.trusted_carLinklist.toString());


        let token = new Token('receive_self_trust_value_handle', new Set([receiver.marker, sender.marker]),
            [receiver.id, sender.id].sort());
        let events = [];
        events.push([sender.marker, new Event('receive_linklist', {sender: receiver, receiver: sender})]);
        events.push([receiver.marker, new Event('receive_linklist', {sender: sender, receiver: receiver})]);
        // events[sender.marker] = new Event('receive_self_trust_value', {sender: p, receiver: sender});
        switcher.put(token, events);
        // sender.marker.emit('receive_linklist', {sender: receiver, receiver: sender});
    } else {
        receiver.untrusted_cars[sender.id] = trust_value;
    }

    delete receiver.unlabeled_cars[sender.id];
}

function receive_remove_update_handle(e) {
    e.receiver.trusted_carLinklist.remove_node_from_sub(e.sender.id, e.removed_id);
}

function receive_insert_update_handle(e) {
    e.receiver.trusted_carLinklist.insert_sub_node(e.sender, e.inserted_car, e.trust_value);
}