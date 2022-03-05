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

    init1() {
        this.generate_ride(new AMap.LngLat(116.50268, 39.870935), new AMap.LngLat(116.501092, 39.870967), 15, false, true);
        this.generate_ride(new AMap.LngLat(116.501949, 39.870811), new AMap.LngLat(116.503537, 39.870753), 15, false, true);
    }

    init2() {
        this.generate_ride(new AMap.LngLat(116.50268, 39.870935), new AMap.LngLat(116.501092, 39.870967), 15, false, true);
        this.generate_ride(new AMap.LngLat(116.502763, 39.871005), new AMap.LngLat(116.501173, 39.87105), 15, false, true);
        this.generate_ride(new AMap.LngLat(116.501949, 39.870811), new AMap.LngLat(116.503537, 39.870753), 15, false, true);
        this.generate_ride(new AMap.LngLat(116.501886, 39.870605), new AMap.LngLat(116.503474, 39.870564), 15, false, true);
    }

    init3() {
        this.generate_ride(new AMap.LngLat(116.50268, 39.870935), new AMap.LngLat(116.501092, 39.870967), 10, false, true);
        this.generate_ride(new AMap.LngLat(116.501949, 39.870811), new AMap.LngLat(116.503537, 39.870753), 10, false, true);
        this.generate_ride(new AMap.LngLat(116.501589, 39.870811), new AMap.LngLat(116.503177, 39.870753), 10, false, true);
        this.generate_ride(new AMap.LngLat(116.501886, 39.870605), new AMap.LngLat(116.503474, 39.870564), 10, false, true);
    }
    

    generate_ride(startPoint=new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance), 
    endPoint=new AMap.LngLat(this.lng+Math.random()*this.location_variance, this.lat+Math.random()*this.location_variance),
    speed=20, moveAlongSwitch=true, show_communication_range=false) {
        let car = new Car(this.map, this.id, speed, this, moveAlongSwitch, show_communication_range);
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