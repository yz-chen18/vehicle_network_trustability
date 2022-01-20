function receive_event_handle(e) {
    if (e.message.id in e.car.trusted_cars) {
        //console.log("trusted::", e.car.trusted_cars[e.message.id]);
    } else if (e.message.id in e.car.untrusted_cars) {
        //console.log("untrusted::", e.car.untrusted_cars[e.message.id]);
    } else {
        //console.log(e);
        e.car.calculate_trust_value(e.message.id, e.message.data);
    }
}