let RouteViewer = function(map) {
    let _map = map;
    let _route;
    this.draw = function (path) {
        _route = new AMap.Polyline({
            map: _map,
            path: path,
            showDir: true,
            strokeColor: "#28F",  //线颜色
            // strokeOpacity: 1,     //线透明度
            strokeWeight: 6,      //线宽
            // strokeStyle: "solid"  //线样式
        });
    }

    this.detach = function () {
        if (_route != null) {
            _map.remove(_route);
            _route = null;
        }
    }
}