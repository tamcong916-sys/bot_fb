const axios = require('axios');
module.exports = [
    {
        name: "setlove",
        async execute(api, event) {
            const info = await api.getThreadInfo(event.threadID); const list = info.participantIDs.filter(id => id !== event.senderID);
            const target = list[Math.floor(Math.random() * list.length)];
            api.getUserInfo([event.senderID, target], async (err, data) => {
                let msg = `💞 Ghép đôi ngẫu nhiên thành công:\n🤵 @${data[event.senderID].name}\n👰 @${data[target].name}\n💘 Tỉ lệ hợp nhau: ${Math.floor(Math.random()*40)+60}%`;
                const mentions = [{ tag: `@${data[event.senderID].name}`, id: event.senderID }, { tag: `@${data[target].name}`, id: target }];
                try {
                    const res = await axios.get(`https://graph.facebook.com/${target}/picture?width=500&height=500`, { responseType: "stream" });
                    return api.sendMessage({ body: msg, mentions: mentions, attachment: res.data }, event.threadID);
                } catch(e) { return api.sendMessage({ body: msg, mentions: mentions }, event.threadID); }
            });
        }
    },
    { name: "thathinh", async execute(api, event) { return api.sendMessage("💬 Hôm nay thời tiết dịu dàng, sao cậu chưa chịu nhẹ nhàng yêu tớ?", event.threadID); } },
    { name: "boi", async execute(api, event, args) { return api.sendMessage(`🔮 Tỉ lệ thành đôi của bạn với [${args.join(" ")}] là ${Math.floor(Math.random()*100)}%`, event.threadID); } }
];
