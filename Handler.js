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

//todo 向其余节点发送删除的消息通知
function receive_remove_from_sub_handle(e) {
    let receiver = e.receiver;
    let sender = e.sender;
    let removed_id = e.removed_id;

    receiver.trusted_carLinklist.remove_node_from_sub(sender.id, removed_id);
}