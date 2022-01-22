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