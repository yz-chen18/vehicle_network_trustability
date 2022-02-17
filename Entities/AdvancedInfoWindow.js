class AdvancedInfoWindow extends AMap.InfoWindow{
    constructor(map, path, content, position, trust_linklist) {
        super({
            content: content,
            position: position,
        });
        this.map = map;
        this.path = path;
        this.route = null;
        this.main_network = {};
        this.sub_network = {}
        this.trust_linklist = trust_linklist;
    }

    open() {
        super.open(this.map);
    }

    draw_route() {
        this.route = new AMap.Polyline({
            map: this.map,
            path: this.path,
            showDir: true,
            strokeColor: "#28F",  //线颜色
            // strokeOpacity: 1,     //线透明度
            strokeWeight: 6,      //线宽
            // strokeStyle: "solid"  //线样式
        });
    }

    clear_route() {
        this.map.remove(this.route);
    }

    draw_network() {
        let head = this.trust_linklist.head;
        while (head.next != null) {
            let path = [super.getPosition(), head.next.car.marker.getPosition()];
            this.main_network[head.next.car.id] = new AMap.Polyline({
                map: this.map,
                path: path,
                showDir: true,
                outlineColor: '#ffeeff',
                borderWeight: 3,
                strokeColor: "#3366FF",
                strokeOpacity: 1,
                strokeWeight: 6,
                strokeStyle: "solid"  //线样式
            });

            let subchain = head.next.subchain;
            this.sub_network[head.next.car.id] = {};
            while (subchain != null) {
                if (subchain.car.id !== this.trust_linklist.head.car.id) {
                    let path = [head.next.car.marker.getPosition(), subchain.car.marker.getPosition()];
                    this.sub_network[head.next.car.id][subchain.car.id] = new AMap.Polyline({
                        map: this.map,
                        path: path,
                        showDir: true,
                        outlineColor: '#ffeeff',
                        borderWeight: 3,
                        strokeColor: "#FF7F27",
                        strokeOpacity: 1,
                        strokeWeight: 6,
                        strokeStyle: "solid"  //线样式
                    });
                }
                subchain = subchain.next;
            }
            head = head.next;
        }
    }

    clear_network() {
        let keys = Object.keys(this.main_network);
        for (let i = 0; i < keys.length; i++) {
            this.map.remove(this.main_network[keys[i]]);
            delete(this.main_network[keys[i]]);
        }

        keys = Object.keys(this.sub_network);
        for (let i = 0; i < keys.length; i++) {
            let sub_keys = Object.keys(this.sub_network[keys[i]]);
            for (let j = 0; j < sub_keys.length; j++) {
                this.map.remove(this.sub_network[keys[i]][sub_keys[j]]);
                delete(this.sub_network[keys[i]][sub_keys[j]]);
            }
        }
    }

    update_network() {
        this.clear_network();
        this.draw_network();
    }
}