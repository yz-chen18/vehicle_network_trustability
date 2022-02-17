class Application {
    constructor(vehicle_num, lng, lat, variance, trust_thresh, send_cycle, needed_amount) {
        this.vehicle_num = vehicle_num;
        this.cars = [];
        this.lng = lng;
        this.lat = lat;
        this.location_variance = variance;
        this.id = 1;
        this.trust_thresh = trust_thresh;
        this.send_cycle = send_cycle;
        this.needed_amount = needed_amount;
        this.map = new AMap.Map("container", {
            resizeEnable: true,
            center: [lng, lat],//地图中心点
            zoom: 13 //地图显示的缩放级别
        });
    }

    init() {
        for (let i = 0; i < this.vehicle_num; i++) {
            this.generate_ride_new();
        }
        this.pauseAnimation();
    }

    generate_ride_new() {
        function speed() {
            return MINIMUM_SPEED + Math.random() * SPEED_RANGE;
        }
        let startPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        let endPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        let car = new Car(this.map, this.id, speed(), this);
        this.id = this.id + 1;
        car.search(startPoint, endPoint, this.cars);
    }

    /*
    generate_ride() {
        function speed() {
            return MINIMUM_SPEED + Math.random() * SPEED_RANGE;
        }
        var startPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        var endPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        var map = this.map;
        var p = this;
        //构造路线导航类
        var driving = new AMap.Driving({
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
                let path = parse(result.routes[0]);

                let is_trustable = (Math.random() > 0);
                var marker = new AMap.Marker({
                    map: map,
                    position: startPoint,
                    icon: (is_trustable) ? "./static/real_car.png" : "./static/fake_car.png",
                    offset: new AMap.Pixel(-13, -26),
                });

                let car = new Car(p.map, path, marker, p.id, speed(), is_trustable, p.needed_amount, p.trust_thresh, p.send_cycle);
                car.marker.setLabel({
                    offset: new AMap.Pixel(0,0),
                    content: p.id,
                    direction: 'center',
                })
                p.id = p.id + 1;

                let sendInterval = setInterval(function send() {
                    for (let i = 0; i < p.cars.length; i++) {
                        if (p.cars[i].id !== car.id) {
                            let dist = distance(p.cars[i].marker.getPosition(), car.marker.getPosition());
                            if (dist < COMMUNICATION_RANGE) {
                                car.send_message(p.cars[i]);
                            }
                        }
                    }
                }, car.send_frequency);

                AMap.plugin('AMap.MoveAnimation', function(){

                    let passedPolyline = new AMap.Polyline({
                        map: map,
                        strokeColor: "FF0000",  //线颜色
                        strokeWeight: 0,      //线宽
                    });

                    car.marker.moveAlong(path, {
                        // 每一段的速度
                        speed: car.speed,
                    });

                    car.marker.on('moving', function (e) {
                        //passedPolyline.setPath(e.passedPath);
                        if (car.show_network) {
                            car.update_network();
                        }
                    });

                    car.marker.on('click', function() {
                        log.success(car.id);
                        console.warn(car.trusted_carLinklist.toString())
                        if (car.show_network === false) {
                            car.draw_route();
                            car.draw_network();
                            car.show_network = true;
                        } else {
                            car.clear_route();
                            car.clear_network();
                            car.show_network = false;
                        }
                    });


                    car.marker.on('movealong', function() {
                        //log.success('Arrive');
                        clearInterval(sendInterval);
                        car.marker.hide();
                        driving.clear();

                        let head = car.trusted_carLinklist.head;

                        while (head.next != null) {
                            clearTimeout(head.next.timer);
                            head = head.next;
                        }

                        p.generate_ride();
                        for (let i=0; i < p.cars.length; i++) {
                            if (p.cars[i].id === car.id) {
                                p.cars.splice(i, 1);
                                break;
                            }
                        }
                        car.clear_route();
                        car.clear_network();
                        car.show_network = false;
                    });

                    car.marker.on('receive_data', receive_data_event_handle_new);

                    car.marker.on('receive_linklist', receive_linklist_event_handle);

                    car.marker.on('receive_self_trust_value', receive_self_trust_value_handle);

                    car.marker.on('receive_remove_update', receive_remove_update_handle);

                    car.marker.on('receive_insert_update', receive_insert_update_handle);
                });

                p.cars.push(car);
            } else {
                log.error('获取驾车数据失败：' + result)
            }
        });

    }*/

    resumeAnimation() {
        let cars = this.cars;
        for (let i = 0; i < cars.length; i++) {
            cars[i].marker.resumeMove();
        }
    }

    //todo 停时钟
    pauseAnimation() {
        let cars = this.cars;
        for (let i = 0; i < cars.length; i++) {
            cars[i].marker.pauseMove();
        }
    }
}