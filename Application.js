class Application {
    constructor(vehicle_num, lng, lat, variance, trust_thresh, send_cycle, needed_amount) {
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
            zoom: 13 //地图显示的缩放级别
        });
    }

    init() {
        for (let i = 0; i < this.vehicle_num; i++) {
            this.generate_ride();
        }
        this.pauseAnimation();
    }

    generate_ride() {
        function speed() {
            return MINIMUM_SPEED + Math.random() * SPEED_RANGE;
        }
        let startPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        let endPoint = new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance);
        let car = new Car(this.map, this.id, speed(), this);
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