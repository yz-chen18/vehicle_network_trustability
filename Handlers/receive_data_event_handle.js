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
        e.receiver.communicator.calculate_trust_value(e.message, e.sender, e.receiver);
    }
}
