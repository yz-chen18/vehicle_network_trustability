function receive_remove_update_handle(e) {
    e.receiver.trusted_carLinklist.remove_node_from_sub(e.sender.id, e.removed_id);
}