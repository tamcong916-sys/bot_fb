require('dotenv').config();
const login = require("fca-unofficial");
const fs = require("fs");

const loginOptions = {
    forceLogin: true,
    listenEvents: true,
    selfListen: false, // Không để bot tự trả lời tin nhắn của chính nó
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};

function startBot() {
    try {
        if (!process.env.APPSTATE) {
            console.error("❌ Thiếu biến môi trường APPSTATE trong file .env!");
            return;
        }
        
        const appState = JSON.parse(process.env.APPSTATE);
        
        login({ appState }, loginOptions, (err, api) => {
            if (err) {
                console.error("❌ Lỗi đăng nhập! Thử lại sau 15 giây...", err);
                return setTimeout(startBot, 15000);
            }
            
            console.log("🛡️ [SYSTEM] BOT Messenger đã khởi chạy thành công dưới chế độ bảo mật!");

            api.setOptions({
                listenEvents: true,
                selfListen: false,
                autoMarkAsRead: true // Giả lập người thật đọc tin nhắn
            });

            // Lắng nghe sự kiện từ MQTT
            api.listenMqtt((err, event) => {
                if (err) {
                    console.error("❌ Lỗi kết nối MQTT, đang khởi động lại luồng...");
                    return startBot();
                }

                // Chuyển tiếp sự kiện sang handler xử lý
                try {
                    require('./handler.js')(api, event);
                } catch (handlerErr) {
                    console.error("❌ Lỗi xử lý Handler:", handlerErr);
                }
            });
        });
    } catch (e) {
        console.error("❌ Lỗi cấu trúc APPSTATE! Hãy kiểm tra lại định dạng JSON.", e);
    }
}

startBot();
