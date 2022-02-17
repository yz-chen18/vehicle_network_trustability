function receive_data_event_handle_new(e) {
    //console.log('Events.receive_data_event_handle:', e);
    let res = e.receiver.trusted_carLinklist.lookup(e.sender.id);
    let carLinkListPos = res[0];
    let carNode = res[1];
    if (carLinkListPos === CarLinkListPosEnum.MAIN) {
        e.receiver.trusted_carLinklist.retiming(carNode);
    } else if (carLinkListPos === CarLinkListPosEnum.SUB) {
        console.warn('before transform', 'transformed id:', e.sender.id, e.receiver.trusted_carLinklist.toString());
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
        console.warn('after transform', 'transformed id:', e.sender.id, e.receiver.trusted_carLinklist.toString());

        let token = new Token('receive_data_event_handle_new', new Set([e.receiver.marker, e.sender.marker]),
            [e.receiver.id, e.sender.id].sort());
        let events = [];
        events.push([e.sender.marker, new Event('receive_linklist', {sender: e.receiver, receiver: e.sender})]);
        events.push([e.receiver.marker, new Event('receive_linklist', {sender: e.sender, receiver: e.receiver})]);
        // events[sender.marker] = new Event('receive_self_trust_value', {sender: p, receiver: sender});
        switcher.put(token, events);
    } else if (e.sender.id in e.receiver.untrusted_cars) {
        // nothing for now
    } else {
        e.receiver.calculate_trust_value(e.message, e.sender);
    }
}