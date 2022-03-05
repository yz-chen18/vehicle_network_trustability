const EARTH_RADIUS = 63713930; //单位 m

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
    return AMap.GeometryUtil.distance(pos1, pos2);
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

function lngLat_distance_to_meter(lnglat_dist) {
    return EARTH_RADIUS * angular_to_rad(lnglat_dist.getLng()) * Math.cos(angular_to_rad(lnglat_dist.getLat()));
}

function lngLat_distance_to_meter(lng_dist, lat_dist) {
    return EARTH_RADIUS * angular_to_rad(lng_dist) * Math.cos(angular_to_rad(lat_dist));
}

function angular_to_rad(angle) {
    return angle * Math.PI / 180;
}