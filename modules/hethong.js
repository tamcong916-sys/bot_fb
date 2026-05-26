const axios = require('axios');
module.exports = [
    {
        name: "menu",
        async execute(api, messageEvent, args, client) {
            const gio = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });
            let menu = `👑 ═══ 🌟 PREMIUM MENU VIP 🌟 ═══ 👑\n`;
            menu += `👤 CHỦ HỆ THỐNG: CONG TAM\n`;
            menu += `⏰ Bây giờ là: ${gio} (Giờ VN chuẩn)\n`;
            menu += `✨ Dấu lệnh: [ ${client.config.prefix} ] • Hồi chiêu Menu: 10s\n`;
            menuMsg = `⚡ Danh sách 30 chức năng chia đều 9 hộp thư:\n`;
            menu += `═══════════════════════════\n\n`;
            menu += `📁 1. HỆ THỐNG CHÍNH\n ├ menu, uptime, uid, ping\n\n`;
            menu += `📁 2. MINI GAMES GIẢI TRÍ\n ├ taixiu, baucua, chanle, daovang\n\n`;
            menu += `📁 3. TÌNH DUYÊN HẸN HÒ\n ├ setlove, thathinh, boi\n\n`;
            menu += `📁 4. QUẢN LÝ BẠN CHÁT\n ├ boxinfo, avt, setname\n\n`;
            menu += `📁 5. KINH TẾ TÍN TIỀN\n ├ daily, work, checkmoney\n\n`;
            menu += `📁 6. QUẢN TRỊ ADMIN\n ├ kick, sendmsg, restart\n\n`;
            menu += `📁 7. ĐA TIỆN ÍCH SỐ\n ├ google, weather, xemgio\n\n`;
            menu += `📁 8. QUẢN LÝ NHÓM CHÁT\n ├ rule, warn, unwarn, banlist\n\n`;
            menu += `📁 9. KHO MEDIA GIẢI TRÍ\n └ anime, meme, joker\n`;
            menu += `═══════════════════════════\n⚠️ Vui lòng gõ ${client.config.prefix} + tên lệnh để dùng!`;
            try {
                const res = await axios.get("https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3p0eXF6N213N25mNXN6NnV5bWp4M3M0N2NidmNyeWZ6OHpxczV0ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1400vJnV6XwulG/giphy.gif", { responseType: "stream" });
                return api.sendMessage({ body: menu, attachment: res.data }, messageEvent.threadID, messageEvent.messageID);
            } catch (e) { return api.sendMessage(menu, messageEvent.threadID); }
        }
    },
    { name: "uptime", async execute(api, event) { return api.sendMessage(`⏱️ Bot hoạt động liên tục: ${Math.floor(process.uptime() / 60)} phút.`, event.threadID); } },
    { name: "uid", async execute(api, event) { return api.sendMessage(`🆔 UID: ${event.messageReply ? event.messageReply.senderID : event.senderID}`, event.threadID); } },
    { name: "ping", async execute(api, event) { return api.sendMessage("🏓 Pong! Hệ thống phản hồi mượt mà.", event.threadID); } }
];
