let CommunicationRangeObserver = function(map, range) {
    let _map = map;
    let _range = range;
    let _circle = null;

    this.attach = function(center) {
        _circle = new AMap.Circle({
            center: center,
            radius: _range, //半径
            borderWeight: 1,
            strokeColor: "#000000", 
            strokeOpacity: 1,
            strokeWeight: 2,
            strokeOpacity: 1,
            fillOpacity: 0,
            strokeStyle: 'solid',
            strokeDasharray: [10, 10], 
            // 线样式还支持 'dashed'
            fillColor: '#ffffff',
            zIndex: 100,
        })
        _circle.setMap(_map);
    }

    this.update = function(lnglat) {
        _circle.setCenter(lnglat);
    }

    this.detach = function() {
        _map.remove(_circle);
    }
}