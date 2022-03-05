class Car {
    constructor(map, id, speed, application, moveAlongSwitch=true, show_communication_range=true, is_trustable=true,
                needed_amount = 20, trust_thresh = 0.6, send_frequency = 5) {
        this.map = map;
        this.path;
        this.marker;
        this.id = id;
        this.speed = speed;
        this.is_trustable = is_trustable;
        this.infoWindow = null;
        this.untrusted_cars = {};
        this.unlabeled_cars = {};


        this.trust_thresh = trust_thresh;
        this.trusted_carLinklist = new CarLinkList(id, this, 1, new Date().getTime());

        //todo 抽象一个数据发送接收器
        this.needed_amount = needed_amount;
        this.send_frequency = send_frequency;
        this.self_real_num = 0;
        this.self_fake_num = 0;
        this.application = application;

        //todo 都是什么变量...
        this.other_trust_value_buffer = 0.0;
        this.other_selftrust_value_buffer = 0.0;
        this.timer = 0;

        //todo 抽象车辆运动的viewer
        this.observer_switch = false;
        this.networkObserver = new NetworkObserver(this.map);
        this.routeViewer = new RouteViewer(this.map);
        this.communicationRangeObserver = new CommunicationRangeObserver(this.map, COMMUNICATION_RANGE)

        this.moveAlongSwitch = moveAlongSwitch;
        this.show_communication_range = show_communication_range;
    }

    search(startPoint, endPoint, cars) {
        let p = this;
        //构造路线导航类
        let driving = new AMap.Driving({
            //map: map,
            autoFitView: false,
            showTraffic: false,
            hideMarkers: true,
            //isOutline: false,
            //panel: "panel"
        });
        // 根据起终点经纬度规划驾车导航路线

        driving.search(startPoint, endPoint, function(status, result) {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
                //log.success('绘制驾车路线完成');
                p.path = parse(result.routes[0]);

                let is_trustable = (Math.random() > 0);
                p.marker = new AMap.Marker({
                    map: p.map,
                    position: startPoint,
                    icon: (is_trustable) ? "./static/real_car.png" : "./static/fake_car.png",
                    offset: new AMap.Pixel(-13, -26),
                });

                if (p.show_communication_range) {
                    p.communicationRangeObserver.attach(startPoint);
                }

                // let car = new Car(p.map, path, marker, p.id, speed(), is_trustable, p.needed_amount, p.trust_thresh, p.send_cycle);
                p.marker.setLabel({
                    offset: new AMap.Pixel(0,0),
                    content: p.id,
                    direction: 'center',
                })

                //todo 改为装饰器或者单独成类
                let sendInterval = setInterval(function send() {
                    for (let i = 0; i < cars.length; i++) {
                        if (cars[i].id !== p.id) {
                            let dist = distance(cars[i].marker.getPosition(), p.marker.getPosition());
                            if (dist < COMMUNICATION_RANGE) {
                                p.send_message(cars[i]);
                            }
                        }
                    }
                }, p.send_frequency);

                AMap.plugin('AMap.MoveAnimation', function(){
                    p.marker.moveAlong(p.path, {
                        // 每一段的速度
                        speed: p.speed,
                    });

                    p.marker.on('moving', function () {
                        //passedPolyline.setPath(e.passedPath);
                        p.movingFunction()
                    });

                    p.marker.on('click', function() {
                        p.clickFunction();
                    });


                    //todo 改为通知Application
                    p.marker.on('movealong', function() {
                        p.movealongFunction(sendInterval, driving, cars)
                    });

                    p.marker.on('receive_data', receive_data_event_handle_new);

                    p.marker.on('receive_linklist', receive_linklist_event_handle);

                    p.marker.on('receive_self_trust_value', receive_self_trust_value_handle);

                    p.marker.on('receive_remove_update', receive_remove_update_handle);

                    p.marker.on('receive_insert_update', receive_insert_update_handle);
                });

                cars.push(p);
            } else {
                log.error('获取驾车数据失败：' + result)
            }
        });

    }

    movingFunction() {
        if (this.observer_switch) {
            //this.update_network();
            this.networkObserver.update(this.trusted_carLinklist, this.marker);
        }
        this.communicationRangeObserver.update(this.marker.getPosition());
    }

    clickFunction() {
        log.success(this.id);
        console.warn(this.trusted_carLinklist.toString())
        if (this.observer_switch === false) {
            this.routeViewer.draw(this.path);
            this.networkObserver.update(this.trusted_carLinklist, this.marker);
            this.observer_switch = true;
        } else {
            this.routeViewer.detach();
            this.networkObserver.detach();
            this.observer_switch = false;
        }
    }

    movealongFunction(sendInterval, driving, cars) {
        //log.success('Arrive');
        clearInterval(sendInterval);
        this.marker.hide();
        driving.clear();

        let head = this.trusted_carLinklist.head;

        while (head.next != null) {
            clearTimeout(head.next.timer);
            head = head.next;
        }

        if (this.moveAlongSwitch) {
            this.application.generate_ride();
        }
    
        for (let i=0; i < cars.length; i++) {
            if (cars[i].id === this.id) {
                cars.splice(i, 1);
                break;
            }
        }
        this.routeViewer.detach();
        this.networkObserver.detach();
        this.communicationRangeObserver.detach();
        this.observer_switch = false;
    }

    // p for the possibility of generating reliable data, p must gt 0
    generate_data() {
        let p;
        if (this.is_trustable) {
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
    send_message(car) {
        let message = new Message(this.id, this.generate_data());
        if (message.data) {
            this.self_real_num += 1;
        } else {
            this.self_fake_num += 1;
        }
        car.marker.emit('receive_data', {message: message, receiver: car, sender: this});
    }

    receive_message(message) {

    }

    // 通过他车发送的信息计算他车的信任值，sender为他车
    calculate_trust_value(message, sender) {
        this.timer += 1;
        if (!(sender.id in this.unlabeled_cars)) {
            this.unlabeled_cars[sender.id] = [0, 0];
        }

        let real_data_num = this.unlabeled_cars[sender.id][1];
        let fake_data_num = this.unlabeled_cars[sender.id][0];

        // 当数据量足以计算信任值且被计算的车辆不在信任链表中
        let res = this.trusted_carLinklist.lookup(sender.id);
        if ((real_data_num + fake_data_num  === this.needed_amount) && (sender.id in this.unlabeled_cars)
            && this.trusted_carLinklist.lookup_main(sender.id) === null) {
            let algo = new TrustValueAlgo(real_data_num, fake_data_num);
            let trust_value = algo.get_trust_value();
            let self_algo = new TrustValueAlgo(this.self_real_num, this.self_fake_num);
            let self_trust_value = self_algo.get_trust_value();
            this.other_trust_value_buffer = trust_value;
            sender.other_selftrust_value_buffer = self_trust_value;

            //todo 存在竞争
            let p = this;
            let token = new Token('calculate_trust_value', new Set([this.marker, sender.marker]),
                [this.id, sender.id].sort());
            let events = [];
            events.push([this.marker, new Event('receive_self_trust_value', {sender: sender, receiver: p})]);
            events.push([sender.marker, new Event('receive_self_trust_value', {sender: p, receiver: sender})]);
            switcher.put(token, events);

        }

        if (sender.id in this.unlabeled_cars) {
            this.unlabeled_cars[sender.id][message.data] += 1;
        }
    }
}