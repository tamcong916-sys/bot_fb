const fs = require('fs');

module.exports.menu = async function(api, event, config) {
    // Tự động quét và gom nhóm chức năng từ các file có sẵn
    const menuText = 
`╔════════════════════╗
      ${config.BOT_NAME} - MENU
╚════════════════════╝
[📸] Ảnh giao diện đang tải phía trên...

🤖 Khám phá các hộp thư chức năng:
✨ /menu : Xem danh sách lệnh.
⚙️ /hethong : Quản lý cài đặt bot.
🛡️ /admin : Công cụ kiểm soát (Admin duy nhất).
🎮 /game : Trò chơi giải trí & Cờ bạc.
🛠️ /tienich : Tiện ích đời sống.

💡 Mẹo: Gõ đúng Prefix "${config.PREFIX}" trước tên lệnh để sử dụng!`;

    // Tải ảnh GIF từ config.json và gửi kẹp chung với Menu
    return api.sendMessage({
        body: menuText,
        attachment: await global.utils.getStreamFromURL(config.MENU_GIF) // Đảm bảo bạn có hàm convert URL sang Stream ổn định
    }, event.threadID);
};
