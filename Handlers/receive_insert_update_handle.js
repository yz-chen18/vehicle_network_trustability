function receive_insert_update_handle(e) {
    e.receiver.trusted_carLinklist.insert_sub_node(e.sender, e.inserted_car, e.trust_value);
}