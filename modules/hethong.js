module.exports.menu = async function(api, event, config, sendSafeMessage, getStreamFromURL) {
    const menuText = 
`╔══════════════════════════════════╗
   🌟 ${config.BOT_NAME.toUpperCase()} - HỆ THỐNG MENU VIP 🌟
╚══════════════════════════════════╝
👑 CHỦ SỞ HỮU HỆ THỐNG:
📝 Quản trị viên: ${config.ADMIN_INFO.NAME}
🆔 ID Admin: ${config.ADMIN_INFO.ID}
🌐 Liên hệ: ${config.ADMIN_INFO.FB_LINK}
⏱️ Giới hạn FPS: Chống spam ${config.ANTI_SPAM_COOLDOWN / 1000}s

⚙️ [ HỘP THƯ LỆNH 1 - HỆ THỐNG ]
➔ ${config.PREFIX}menu : Hiển thị bảng danh sách tính năng này.

🛡️ [ HỘP THƯ LỆNH 2 - QUẢN TRỊ VIÊN ] (Chỉ Admin)
➔ ${config.PREFIX}addbox [ID] : Cấp phép cho ID nhóm được dùng bot.
➔ ${config.PREFIX}delbox [ID] : Thu hồi quyền dùng bot của nhóm.
➔ ${config.PREFIX}approve [ID] : Phê duyệt quyền thành viên VIP.
➔ ${config.PREFIX}remove [ID] : Xóa quyền sử dụng bot của thành viên.
➔ ${config.PREFIX}checkbot : Quét và liệt kê tất cả các nhóm bot đang ở.
➔ ${config.PREFIX}kick @tag : Trục xuất tài khoản ra khỏi nhóm chat.
➔ ${config.PREFIX}boxname [Tên] : Thay đổi tên nhóm chat siêu tốc.
➔ ${config.PREFIX}lock / unlock : Bật/Tắt chế độ phê duyệt vào nhóm.

🎮 [ HỘP THƯ LỆNH 3 - CASINO GIẢI TRÍ ]
➔ ${config.PREFIX}taixiu [tai/xiu] [tiền] : Trò chơi tài xỉu siêu VIP.

🛠️ [ HỘP THƯ LỆNH 4 - CÔNG CỤ TIỆN ÍCH ]
➔ ${config.PREFIX}avatar @tag : Lấy ảnh đại diện chất lượng cao (Tránh lệch tag).

────────────────────────────────────
💡 Hệ thống API đã tối ưu hóa luồng truyền dữ liệu, chạy êm và mượt không giật lag!`;

    // Gọi luồng ảnh GIF từ config tốc độ cao
    const stream = await getStreamFromURL(config.MENU_GIF);

    const msgData = {
        body: menuText,
        attachment: stream ? stream : [] // Nếu link GIF bị lỗi, mảng rỗng giúp bot vẫn gửi tin nhắn văn bản thay vì báo lỗi hệ thống
    };

    sendSafeMessage(msgData, event.threadID);
};
