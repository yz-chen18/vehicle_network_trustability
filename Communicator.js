let Communicator = function(amount = 20, frequency = 5, thresh = 0.6) {
    let needed_amount = amount;
    let send_frequency = frequency; //发送周期，单位为毫秒
    let self_real_num = 0;
    let self_fake_num = 0;

    this.untrusted_cars = {};
    this.unlabeled_cars = {};
    let trust_thresh = thresh;
    this.trusted_carLinklist = null;

    let timer = 0;

    this.init = function(cars, self_car, driving) {
        //todo 改为装饰器或者单独成类
        this.trusted_carLinklist = new CarLinkList(self_car.id, self_car, 1, new Date().getTime())
        let sendInterval = setInterval(function send() {
            for (let i = 0; i < cars.length; i++) {
                if (cars[i].id !== self_car.id) {
                    let dist = distance(cars[i].marker.getPosition(), self_car.marker.getPosition());
                    if (dist < COMMUNICATION_RANGE) {
                        let message = new Message(self_car.id, generate_data(self_car.is_trustable));
                        send_message(message, cars[i], self_car);
                    }
                }
            }
        }, send_frequency);

        //todo Observer
        AMap.plugin('AMap.MoveAnimation', function() {
            self_car.marker.moveAlong(self_car.path, {
                // 每一段的速度
                speed: self_car.speed,
            });
        });

        self_car.marker.on('moving', function () {/*passedPolyline.setPath(e.passedPath);*/self_car.movingFunction()});
        self_car.marker.on('click', function () {self_car.clickFunction();});
        //todo 改为通知Application
        self_car.marker.on('movealong', function () {self_car.movealongFunction(sendInterval, driving, cars)});
        self_car.marker.on('receive_data', receive_data_event_handle_new);
        self_car.marker.on('receive_linklist', receive_linklist_event_handle);
        self_car.marker.on('receive_self_trust_value', receive_self_trust_value_handle);
        self_car.marker.on('receive_remove_update', receive_remove_update_handle);
        self_car.marker.on('receive_insert_update', receive_insert_update_handle);
    }

    // p for the possibility of generating reliable data, p must gt 0
    let generate_data = function(is_trustable) {
        let p;
        if (is_trustable) {
            p = 1;
            // p = Math.random()*0.1 + 0.9;
        } else {
            p = Math.random()*POSSIBILITY_RANGE + MINIMUM_POSSIBILITY;
        }
        let rand = Math.random()/p;
        if (rand <= 1) {
            return 1;
        } else {
            return 0;
        }
    }

    // car为接收方
    let send_message = function(message, receiver, sender) {
        if (message.data) {
            self_real_num += 1;
        } else {
            self_fake_num += 1;
        }
        receiver.marker.emit('receive_data', {message: message, receiver: receiver, sender: sender});
    }

    let receive_message = function(message) {

    }

    // 通过他车发送的信息计算他车的信任值，sender为他车
    this.calculate_trust_value = function(message, sender, self_car) {
        timer += 1;
        if (!(sender.id in this.unlabeled_cars)) {
            this.unlabeled_cars[sender.id] = [0, 0];
        }

        let real_data_num = this.unlabeled_cars[sender.id][1];
        let fake_data_num = this.unlabeled_cars[sender.id][0];

        // 当数据量足以计算信任值且被计算的车辆不在信任链表中
        if ((real_data_num + fake_data_num  === needed_amount) && (sender.id in this.unlabeled_cars)
            && this.trusted_carLinklist.lookup_main(sender.id) === null) {
            let algo = new TrustValueAlgo(real_data_num, fake_data_num);
            let trust_value = algo.get_trust_value();
            let self_algo = new TrustValueAlgo(self_real_num, self_fake_num);
            let self_trust_value = self_algo.get_trust_value();

            //todo 放到消息中
            self_car.other_trust_value_buffer = trust_value;
            sender.other_selftrust_value_buffer = self_trust_value;

            console.warn('id', self_car.id, sender.id)

            let token = new Token('calculate_trust_value', new Set([self_car.marker, sender.marker]),
                [self_car.id, sender.id].sort());
            let events = [];
            events.push([self_car.marker, new Event('receive_self_trust_value', {sender: sender, receiver: self_car})]);
            events.push([sender.marker, new Event('receive_self_trust_value', {sender: self_car, receiver: sender})]);
            switcher.put(token, events);

        }

        if (sender.id in this.unlabeled_cars) {
            this.unlabeled_cars[sender.id][message.data] += 1;
        }
    }
}