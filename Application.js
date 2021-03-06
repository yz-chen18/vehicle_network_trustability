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
            this.generate_ride();
        }
    }

    generate_ride() {
        //todo 汽车速度策略
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

        let is_trustable = (Math.random() > 0);
        var marker = new AMap.Marker({
            map: map,
            position: startPoint,
            icon: (is_trustable) ? "./static/real_car.png" : "./static/fake_car.png",
            offset: new AMap.Pixel(-13, -26),
        });

        let car = new Car(marker, this.id, speed(), is_trustable, this.needed_amount, this.trust_thresh, this.send_cycle);
        car.marker.setLabel({
            offset: new AMap.Pixel(0,0),
            content: this.id,
            direction: 'center',
        })
        this.id = this.id + 1;

        let sendInterval = setInterval(function send() {
            for (let i = 0; i < cars.length; i++) {
                if (cars[i].id !== car.id) {
                    let dist = distance(cars[i].marker.getPosition(), car.marker.getPosition());
                    if (dist < COMMUNICATION_RANGE) {
                        car.send_message(cars[i]);
                    }
                }
            }
        }, car.send_frequency);

        driving.search(startPoint, endPoint, function(status, result) {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
                //log.success('绘制驾车路线完成');
                let path = parse(result.routes[0]);

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
                        passedPolyline.setPath(e.passedPath);
                        if (car.infoWindow != null) {
                            car.infoWindow.setPosition(car.marker.getPosition());
                            let content = car.trusted_carLinklist.toString();
                            if (content !== car.infoWindow.getContent()) {
                                car.infoWindow.setContent(content);
                            }
                        }
                    });

                    car.marker.on('click', function() {
                        log.success(car.id);
                        console.warn(car.trusted_carLinklist.toString())
                        if (car.infoWindow == null) {
                            car.infoWindow = new AdvancedInfoWindow(map, path, car.marker.getPosition(),
                                    car.marker.getPosition());
                        }
                        car.infoWindow.on('close', function () {
                            map.remove(car.infoWindow.route);
                            car.infoWindow = null;
                        })
                        car.infoWindow.open(map, car.marker.getPosition());
                        car.infoWindow.draw_route(map, path);
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
                        for (let i=0; i < cars.length; i++) {
                            if (cars[i].id === car.id) {
                                cars.splice(i, 1);
                                break;
                            }
                        }
                        if (car.infoWindow != null) {
                            car.infoWindow.close();
                            map.remove(car.infoWindow.route);
                            car.infoWindow = null;
                        }
                    });

                    car.marker.on('receive_data', receive_data_event_handle);

                    car.marker.on('receive_linklist', receive_linklist_event_handle);

                    car.marker.on('receive_self_trust_value', receive_self_trust_value_handle);

                    car.marker.on('receive_remove_from_sub', receive_remove_from_sub_handle);
                });

            } else {
                log.error('获取驾车数据失败：' + result)
            }
        });

        this.cars.push(car);

        const cars = this.cars;
        //todo 通过位置判定是否触发可信判断
        setInterval(function check_for_distance() {
            for (let i = 0; i < cars.length; i++) {
                if (cars[i].id !== car.id) {
                    let p_other = cars[i].marker.getPosition();
                    let p = car.marker.getPosition();
                    if (distance(p_other, p) <= COMMUNICATION_RANGE) {

                    }
                }
            }
        }, 1000);
    }
}