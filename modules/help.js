module.exports = {
    name: "help",
    description: "Xem danh sách tất cả các lệnh của bot",
    run: async function(api, event, args) {
        const msg = `=== 🤖 MENU BOT PRO ===\n\n` +
                    `1. ${process.env.PREFIX}help : Xem menu bot\n` +
                    `2. ${process.env.PREFIX}link [từ khóa/url] : Kết nối API Web lấy link tải media\n` +
                    `3. ${process.env.PREFIX}antispam : Kiểm tra trạng thái bảo mật chống quét\n\n` +
                    `👉 Hãy gõ đúng cấu trúc để sử dụng!`;
                    
        return api.sendMessage(msg, event.threadID, event.messageID);
    }
};
