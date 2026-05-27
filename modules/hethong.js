module.exports.menu = async function(api, event, config, sendDelayedMessage) {
    const menuText = 
`╔═════════════════════════╗
        ${config.BOT_NAME.toUpperCase()} MENU VIP
╚═════════════════════════╝
👑 THÔNG TIN QUẢN TRỊ VIÊN:
📝 Tên Admin: ${config.ADMIN_INFO.NAME}
🆔 ID Admin: ${config.ADMIN_INFO.ID}
🌐 Facebook: ${config.ADMIN_INFO.FB_LINK}
⏱️ Độ trễ phản hồi: ${config.DELAY_MESSAGE / 1000} giây

───────────────────────────
🤖 DANH SÁCH CÁC HỘP THƯ LỆNH:

⚙️ HỘP HỆ THỐNG:
   ➔ ${config.PREFIX}menu : Xem thông tin menu hệ thống.

🛡️ HỘP QUẢN TRỊ (Chỉ Admin):
   ➔ ${config.PREFIX}approve [ID] : Phê duyệt quyền sử dụng bot.
   ➔ ${config.PREFIX}remove [ID] : Thu hồi quyền sử dụng bot.
   ➔ ${config.PREFIX}checkbot : Quét các nhóm bot đang ở.
   ➔ ${config.PREFIX}kick @tag : Trục xuất thành viên khỏi nhóm.
   ➔ ${config.PREFIX}boxname [Tên] : Thay đổi tên nhóm chat.
   ➔ ${config.PREFIX}lock / unlock : Bật/Tắt chế độ duyệt nhóm.

🎮 HỘP GIẢI TRÍ:
   ➔ ${config.PREFIX}taixiu [tai/xiu] [tiền] : Casino tài xỉu siêu VIP.

───────────────────────────
💡 Bạn đã được Admin phê duyệt để sử dụng các tính năng thành viên!`;

    // Chuẩn bị tin nhắn kẹp ảnh gửi lên đầu tiên
    const msgData = {
        body: menuText,
        attachment: await global.utils.getStreamFromURL(config.MENU_GIF) 
    };

    // Gọi hàm gửi tin nhắn có tích hợp sẵn delay
    sendDelayedMessage(msgData, event.threadID);
};
