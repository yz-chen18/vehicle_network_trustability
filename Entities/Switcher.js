// 中间件，当且仅当双方需要进行一定操作后才能交换数据时，作为中间媒介存储先后分别存储操作结果后再通知双方进行后续数据交换工作
class Switcher {
    constructor() {
        this.registry = {};
    }

    put(token, events, goods = null) {
        console.info('Switcher.put', token, goods, events, this.registry, token.getHash());
        if (!(token.getHash() in this.registry)) {
            this.registry[token.getHash()] = new Box(token.participants.size);
        }

        console.warn(token.getHash(), events, this.registry);
        if (this.registry[token.getHash()].put(goods)) {
            // 触发交换事件

            token.participants.forEach(function (participant) {
                for (let i = 0; i < events.length; i++) {
                    if (events[i][0] === participant) {
                        participant.emit(events[i][1].event_name, events[i][1].params);
                    }
                }
            });
            delete this.registry[token.getHash()];
        }
    }
}

class Box {
    constructor(num) {
        this.num = num;
        this.storage = [];
    }

    put(goods) {
        this.storage.push(goods);
        //console.log('Box.put', goods, JSON.stringify(self.storage), self.storage.length === self.num, self.storage.length, self.num);
        return this.storage.length === this.num;
    }
}

class Token {
    constructor(channel_name, participants, sorted_ids) {
        this.channel_name = channel_name;
        this.participants = participants;
        this.sorted_ids = sorted_ids;
    }

    getHash() {
        let s = this.channel_name;
        for (let i = 0; i < this.sorted_ids.length; i++) {
            s = s + this.sorted_ids[i];
        }
        return s;
    }
}