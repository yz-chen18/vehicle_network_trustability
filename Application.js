class Application {
    constructor(vehicle_num, lng, lat, variance) {
        this.vehicle_num = vehicle_num;
        this.cars = [];
        this.timers = [];
        this.lng = lng;
        this.lat = lat;
        this.variance = variance;
        this.id = 0;
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
            return 60+Math.random()*40;
        }
        var startPoint = new AMap.LngLat(this.lng+Math.random()*this.variance, this.lat+Math.random()*this.variance);
        var endPoint = new AMap.LngLat(this.lng+Math.random()*this.variance, this.lat+Math.random()*this.variance);
        var map = this.map;
        var p = this;
        //构造路线导航类
        var driving = new AMap.Driving({
            map: map,
            autoFitView: false,
            showTraffic: false,
            hideMarkers: true,
            //panel: "panel"
        });
        // 根据起终点经纬度规划驾车导航路线
        var marker = new AMap.Marker({
            map: map,
            position: startPoint,
            icon: "https://a.amap.com/jsapi_demos/static/demo-center-v2/car.png",
            offset: new AMap.Pixel(-13, -26),
        });

        //todo id多线程下重复？同时，考虑通过标记展示汽车id
        let car = new Car(marker, this.id, speed());
        this.id = this.id + 1;

        driving.search(startPoint, endPoint, function(status, result) {
            // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
            if (status === 'complete') {
                //log.success('绘制驾车路线完成');
                var path = parse(result.routes[0]);

                AMap.plugin('AMap.MoveAnimation', function(){

                    var passedPolyline = new AMap.Polyline({
                        map: map,
                        strokeColor: "FF0000",  //线颜色
                        strokeWeight: 0,      //线宽
                    });

                    marker.on('moving', function (e) {
                        passedPolyline.setPath(e.passedPath);
                    });

                    marker.moveAlong(path, {
                        // 每一段的速度
                        speed: car.speed,
                    });

                    marker.on('click', function() {
                        log.success(car.id);}
                    );


                    marker.on('movealong', function() {
                        //log.success('Arrive');
                        marker.hide();
                        driving.clear();
                        p.generate_ride();
                    });

                    marker.off('click', function() {});

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
                    var p_other = cars[i].marker.getPosition();
                    var p = car.marker.getPosition();
                    if (Math.pow(p_other.getLng()-p.getLng(), 2) + Math.pow(p_other.getLat()-p.getLat(), 2) <= 0.001) {
                    }
                }
            }
        }, 1000);
    }
}