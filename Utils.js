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