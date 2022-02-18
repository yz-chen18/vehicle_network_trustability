function receive_linklist_event_handle(e) {
    console.warn(e.receiver.id, 'before insert linklist, inserted id', e.sender.id, e.receiver.communicator.trusted_carLinklist.toString(), e);
    let carLinklist = e.sender.communicator.trusted_carLinklist;
    e.receiver.communicator.trusted_carLinklist.insert_linklist(carLinklist)
    console.warn(e.receiver.id, 'after insert linklist, inserted id', e.sender.id, e.receiver.communicator.trusted_carLinklist.toString(), e);
}