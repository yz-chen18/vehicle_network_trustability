function receive_data_event_handle(e) {
    //console.log('Events.receive_data_event_handle:', e);
    if (e.receiver.trusted_carLinklist.lookup_main(e.sender.id)) {
        //console.log("trusted::", e.car.trusted_cars[e.message.id]);
    } else if (e.sender.id in e.receiver.untrusted_cars) {
        //console.log("untrusted::", e.car.untrusted_cars[e.message.id]);
    } else {
        //console.log(e);
        e.receiver.calculate_trust_value(e.message, e.sender);
    }
}

function receive_linklist_event_handle(e) {
    let carLinklist = e.carLinklist;
    e.receiver.trusted_carLinklist.insert_linklist(carLinklist)
}

function receive_self_trust_value_handle(e) {
    let sender = e.sender;
    let receiver = e.receiver;
    let trust_value = Math.min(sender.self_trust_value_buffer, receiver.other_trust_value_buffer);
    console.info('receive_self_trust_value_handle', trust_value, sender.self_trust_value_buffer,
        receiver.other_trust_value_buffer, e);

    if (trust_value > receiver.trust_thresh) {
        console.warn(receiver.id, 'before insert_node', receiver.trusted_carLinklist,
            JSON.stringify(receiver.trusted_carLinklist.toString()), 'inserted id:', sender.id);
        receiver.trusted_carLinklist.insert_node(sender.id, trust_value);
        console.warn(receiver.id, 'after insert_node', receiver.trusted_carLinklist,
            JSON.stringify(receiver.trusted_carLinklist.toString()));
        sender.marker.emit('receive_linklist', {carLinklist: receiver.trusted_carLinklist, receiver: sender});
    } else {
        receiver.untrusted_cars[sender.id] = trust_value;
    }
}