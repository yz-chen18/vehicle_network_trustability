let NetworkObserver = function(map) {
    let _map = map;
    let main_network = {};
    let sub_network = {};

    this.update = function(trusted_carLinklist, marker) {
        this.clear();
        draw(trusted_carLinklist, marker);
    }

    function draw(trusted_carLinklist, marker) {
        let head = trusted_carLinklist.head;
        while (head.next != null) {
            let _path = [marker.getPosition(), head.next.car.marker.getPosition()];
            main_network[head.next.car.id] = new AMap.Polyline({
                map: _map,
                path: _path,
                showDir: true,
                outlineColor: '#ffeeff',
                borderWeight: 3,
                strokeColor: "#3366FF",
                strokeOpacity: 1,
                strokeWeight: 6,
                strokeStyle: "solid"  //线样式
            });

            let subchain = head.next.subchain;
            sub_network[head.next.car.id] = {};
            while (subchain != null) {
                if (subchain.car.id !== trusted_carLinklist.head.car.id) {
                    let _path = [head.next.car.marker.getPosition(), subchain.car.marker.getPosition()];
                    sub_network[head.next.car.id][subchain.car.id] = new AMap.Polyline({
                        map: _map,
                        path: _path,
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

    this.clear = function() {
        let keys = Object.keys(main_network);
        for (let i = 0; i < keys.length; i++) {
            _map.remove(main_network[keys[i]]);
            delete(main_network[keys[i]]);
        }

        keys = Object.keys(sub_network);
        for (let i = 0; i < keys.length; i++) {
            let sub_keys = Object.keys(sub_network[keys[i]]);
            for (let j = 0; j < sub_keys.length; j++) {
                _map.remove(sub_network[keys[i]][sub_keys[j]]);
                delete(sub_network[keys[i]][sub_keys[j]]);
            }
        }
    }
}

