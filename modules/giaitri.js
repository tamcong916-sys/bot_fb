const axios = require('axios');
module.exports = [
    { name: "anime", async execute(api, event) { const res = await axios.get("https://api.waifu.pics/sfw/waifu"); const img = await axios.get(res.data.url, {responseType: "stream"}); return api.sendMessage({body: "🌸 Ảnh Waifu Anime ngẫu nhiên:", attachment: img.data}, event.threadID); } },
    { name: "meme", async execute(api, event) { const img = await axios.get("https://picsum.photos/500/500", {responseType: "stream"}); return api.sendMessage({body: "🤣 Meme giải trí cười ỉa:", attachment: img.data}, event.threadID); } },
    { name: "joker", async execute(api, event) { return api.sendMessage("🤡 Trò đùa hôm nay: Tại sao lập trình viên thích bóng tối? Vì ánh sáng làm lộ ra quá nhiều BUG!", event.threadID); } }
];
