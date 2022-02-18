class Car {
    constructor(map, id, speed, application, communicator,  is_trustable=true,
                needed_amount = 20, trust_thresh = 0.6, send_frequency = 5) {
        this.map = map;
        this.path = null;
        this.marker = null;
        this.id = id;
        this.speed = speed;
        this.is_trustable = is_trustable;
        this.untrusted_cars = {};
        this.unlabeled_cars = {};
        this.trust_thresh = trust_thresh;
        this.trusted_carLinklist = new CarLinkList(id, this, 1, new Date().getTime());

        //todo 抽象一个数据发送接收器
        this.communicator = communicator;

        this.application = application;

        //todo 都是什么变量...
        this.other_trust_value_buffer = 0.0;
        this.other_selftrust_value_buffer = 0.0;
        this.timer = 0;

        //todo Observer
        this.observer_switch = false;
        this.networkObserver = new NetworkObserver(this.map);
        this.routeViewer = new RouteViewer(this.map);
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

                // let car = new Car(p.map, path, marker, p.id, speed(), is_trustable, p.needed_amount, p.trust_thresh, p.send_cycle);
                p.marker.setLabel({
                    offset: new AMap.Pixel(0,0),
                    content: p.id,
                    direction: 'center',
                })

                p.communicator.init(cars, p, driving);

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
    }

    clickFunction() {
        log.success(this.id);
        console.warn(this.trusted_carLinklist.toString())
        if (this.observer_switch === false) {
            this.routeViewer.draw(this.path);
            this.networkObserver.update(this.trusted_carLinklist, this.marker);
            this.observer_switch = true;
        } else {
            this.routeViewer.clear();
            this.networkObserver.clear();
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

        this.application.generate_ride_new();
        for (let i=0; i < cars.length; i++) {
            if (cars[i].id === this.id) {
                cars.splice(i, 1);
                break;
            }
        }
        this.routeViewer.clear();
        this.networkObserver.clear();
        this.observer_switch = false;
    }
}