module.exports.menu = async function(api, event, config, sendSafeMessage, getStreamFromURL) {
    const menuText = 
`╔═════════════════════════╗
        ${config.BOT_NAME.toUpperCase()} MENU VIP
╚═════════════════════════╝
👑 THÔNG TIN QUẢN TRỊ VIÊN:
📝 Tên Admin: ${config.ADMIN_INFO.NAME}
🆔 ID Admin: ${config.ADMIN_INFO.ID}
🌐 Facebook: ${config.ADMIN_INFO.FB_LINK}
⏱️ FPS Cooldown: ${config.ANTI_SPAM_COOLDOWN / 1000}s

───────────────────────────
🤖 DANH SÁCH LỆNH QUẢN LÝ BOX:
⚙️ Quản lý ID Box (Chỉ Admin):
   ➔ ${config.PREFIX}addbox [ID] : Cho phép nhóm sử dụng bot.
   ➔ ${config.PREFIX}delbox [ID] : Chặn nhóm sử dụng bot.

🛡️ Quản trị thành viên (Chỉ Admin):
   ➔ ${config.PREFIX}approve [ID] : Phê duyệt người dùng.
   ➔ ${config.PREFIX}remove [ID] : Thu hồi quyền người dùng.
   ➔ ${config.PREFIX}kick @tag : Loại thành viên ra khỏi nhóm.
   ➔ ${config.PREFIX}boxname [Tên] : Đổi tên nhóm chat.
   ➔ ${config.PREFIX}lock / unlock : Bật/Tắt chế độ duyệt nhóm.

🎮 Trò chơi giải trí:
   ➔ ${config.PREFIX}taixiu [tai/xiu] [tiền] : Casino tài xỉu VIP.

───────────────────────────
💡 Hệ thống API đã được tối ưu hóa mượt mà, chống giật lag tin nhắn.`;

    // Gọi stream ảnh GIF từ config.json tốc độ cao
    const stream = await getStreamFromURL(config.MENU_GIF);

    const msgData = {
        body: menuText,
        attachment: stream ? stream : [] // Nếu link GIF lỗi, mảng rỗng giúp bot vẫn gửi tin nhắn chữ thông thường, không bị chết đứng lệnh
    };

    sendSafeMessage(msgData, event.threadID);
};
