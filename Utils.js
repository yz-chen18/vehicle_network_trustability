function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function parse(route) {
    var path = []

    for (var i = 0, l = route.steps.length; i < l; i++) {
        var step = route.steps[i]

        for (var j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
        }
    }

    return path
}

function distance(pos1, pos2) {
    let lng1 = pos1.getLng();
    let lat1 = pos1.getLat();
    let lng2 = pos2.getLng();
    let lat2 = pos2.getLat();

    return Math.sqrt(Math.pow(lng1-lng2, 2) + Math.pow(lat1-lat2, 2));
}

function draw_route(map, path) {
    return new AMap.Polyline({
        map: map,
        path: path,
        showDir: true,
        strokeColor: "#28F",  //线颜色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6,      //线宽
        // strokeStyle: "solid"  //线样式
    });
}