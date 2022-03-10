let Timer = function(miliseconds, handler, cycle = 10) {
    let _time = miliseconds;
    let _count = miliseconds / cycle;
    let _cycle = cycle;
    let _handler = handler;
    let _interval = null;

    this.pause = function() {
        if (_interval != null) {
            clearInterval(_interval);
        }
    }

    this.resume = function() {
        console.error("resume");
        _interval = setInterval(function() {
            _count = _count - 1;
            if (_count === 0) {
                clearInterval(_interval);
                _handler();
            }
        }, _cycle);
    }

    this.stop = function() {
        console.error("stop")
        clearInterval(_interval);
    }

    this.retiming = function() {
        // console.error("retiming", _interval);
        if (_interval != null) {
            clearInterval(_interval);

        }
        _count = _time / _cycle;
        _interval = setInterval(function() {
            _count = _count - 1;
            if (_count === 0) {
                // console.error("time's up");
                clearInterval(_interval);
                _handler();
            }
        }, _cycle);
    }
}