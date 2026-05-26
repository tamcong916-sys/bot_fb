const axios = require('axios');
module.exports = [
    { name: "boxinfo", async execute(api, event) { const info = await api.getThreadInfo(event.threadID); return api.sendMessage(`📦 Nhóm: ${info.threadName}\n🆔 ID Box: ${event.threadID}\n👥 Thành viên: ${info.participantIDs.length}`, event.threadID); } },
    {
        name: "avt",
        async execute(api, event, args) {
            let id = event.messageReply ? event.messageReply.senderID : (Object.keys(event.mentions)[0] || args[0] || event.senderID);
            const res = await axios.get(`https://graph.facebook.com/${id}/picture?width=720&height=720`, { responseType: "stream" });
            return api.sendMessage({ body: `📸 Ảnh đại diện của UID [${id}]:`, attachment: res.data }, event.threadID);
        }
    },
    { name: "setname", async execute(api, event, args) { let n = args.join(" "); api.changeNickname(n, event.threadID, event.senderID); return api.sendMessage("✅ Đã đổi biệt danh!", event.threadID); } }
];
