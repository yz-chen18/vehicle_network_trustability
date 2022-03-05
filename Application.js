class Application {
    constructor(vehicle_num, lng, lat, variance, trust_thresh, send_cycle, needed_amount, zoom) {
        this.vehicle_num = vehicle_num;
        this.cars = [];
        this.lng = lng;
        this.lat = lat;
        this.location_variance = variance;
        this.id = 1;
        this.trust_thresh = trust_thresh;
        this.map = new AMap.Map("container", {
            resizeEnable: true,
            center: [lng, lat],//地图中心点
            zoom: zoom //地图显示的缩放级别
        });
    }

    default_init() {
        this.generate_ride(new AMap.LngLat(116.50338, 39.870905), new AMap.LngLat(116.501792, 39.87095), 20, false);
        this.generate_ride(new AMap.LngLat(116.503463, 39.871005), new AMap.LngLat(116.501873, 39.87105), 20, false);
        this.generate_ride(new AMap.LngLat(116.501049, 39.870811), new AMap.LngLat(116.502637, 39.870753), 20, false);
        this.generate_ride(new AMap.LngLat(116.500966, 39.870642), new AMap.LngLat(116.502554, 39.870597), 20, false);
    }

    generate_ride(startPoint=new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance), 
    endPoint=new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance),
    speed=20, moveAlongSwitch=true) {
        let car = new Car(this.map, this.id, speed, this, moveAlongSwitch);
        this.id = this.id + 1;
        car.search(startPoint, endPoint, this.cars);
    }

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