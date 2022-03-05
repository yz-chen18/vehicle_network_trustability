let CanvasDrawer = function(canvasId) {
    let _canvas = document.getElementById(canvasId);
    let _ctx = _canvas.getContext("2d");

    this.draw = function(linklist) {
        let head = linklist.head;
        let x = 15;
        let y = 15;
        let r = 10;
        while (head != null) {
            _ctx.beginPath();
            _ctx.arc(x, y, r, 0, 2*Math.PI);
            _ctx.stroke();
            _ctx.font="8px Arial";
            _ctx.fillText(head.id, x-3, y+3);

            let subchain = head.subchain;
            let sub_x = x;
            let sub_y = y + 15;
            while (subchain != null) {
                _ctx.beginPath();
                _ctx.moveTo(sub_x, sub_y);
                _ctx.lineTo(sub_x, sub_y + 5);
                _ctx.stroke();

                _ctx.beginPath();
                _ctx.moveTo(sub_x, sub_y + 5);
                _ctx.lineTo(sub_x-1, sub_y + 4);
                _ctx.stroke();

                _ctx.beginPath();
                _ctx.moveTo(sub_x, sub_y + 5);
                _ctx.lineTo(sub_x+1, sub_y + 4);
                _ctx.stroke();

                sub_y = sub_y + 20;
                _ctx.beginPath();
                _ctx.arc(sub_x, sub_y, r, 0, 2*Math.PI);
                _ctx.stroke();
                _ctx.font="8px Arial";
                _ctx.fillText(subchain.id, sub_x-3, sub_y+3);

                sub_y = sub_y + 15;

                subchain = subchain.next;
            }

            x = x + 15;
            _ctx.beginPath();
            _ctx.moveTo(x, y);
            _ctx.lineTo(x + 5, y);
            _ctx.stroke();

            _ctx.beginPath();
            _ctx.moveTo(x + 5, y);
            _ctx.lineTo(x + 4, y - 1);
            _ctx.stroke();

            _ctx.beginPath();
            _ctx.moveTo(x + 5, y);
            _ctx.lineTo(x + 4, y + 1);
            _ctx.stroke();

            x = x + 20;
            head = head.next;
        }
    }

    this.clear = function() {
        _ctx.clearRect(0, 0, 400, 200);
    }
}