function receive_self_trust_value_handle(e) {
    let sender = e.sender;
    let receiver = e.receiver;
    let trust_value = Math.min(receiver.other_selftrust_value_buffer, receiver.other_trust_value_buffer);

    if (trust_value > receiver.trust_thresh) {
        console.warn(receiver.id, 'before insert_node', receiver.communicator.trusted_carLinklist,
            receiver.communicator.trusted_carLinklist.toString(), 'inserted id:', sender.id, 'trust value:', trust_value);
        receiver.communicator.trusted_carLinklist.insert_node(sender, trust_value, receiver.trust_thresh);
        console.warn(receiver.id, 'after insert_node', receiver.communicator.trusted_carLinklist,
            receiver.communicator.trusted_carLinklist.toString());


        let token = new Token('receive_self_trust_value_handle', new Set([receiver.marker, sender.marker]),
            [receiver.id, sender.id].sort());
        let events = [];
        events.push([sender.marker, new Event('receive_linklist', {sender: receiver, receiver: sender})]);
        events.push([receiver.marker, new Event('receive_linklist', {sender: sender, receiver: receiver})]);
        // events[sender.marker] = new Event('receive_self_trust_value', {sender: p, receiver: sender});
        switcher.put(token, events);
        // sender.marker.emit('receive_linklist', {sender: receiver, receiver: sender});
    } else {
        receiver.communicator.untrusted_cars[sender.id] = trust_value;
    }

    delete receiver.communicator.unlabeled_cars[sender.id];
}