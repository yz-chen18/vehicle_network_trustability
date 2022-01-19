class AdvancedInfoWindow extends AMap.InfoWindow{
    constructor(map, path, content, position) {
        super({
            content: content,
            position: position,
        });
        this.map = map;
        this.path = path;
        this.route = null;
    }

    draw_route = function(map, path) {
        this.route = new AMap.Polyline({
            map: map,
            path: path,
            showDir: true,
            strokeColor: "#28F",  //线颜色
            // strokeOpacity: 1,     //线透明度
            strokeWeight: 6,      //线宽
            // strokeStyle: "solid"  //线样式
        });
    }
}