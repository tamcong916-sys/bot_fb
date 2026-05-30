require('dotenv').config();
const login = require("fca-unofficial");

// 1. Giả lập Trình duyệt của người dùng thật (Thay đổi định kỳ)
const loginOptions = {
    forceLogin: true,
    listenEvents: true,
    selfListen: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};

function startBot() {
    try {
        // Gọi appstate bảo mật từ biến môi trường
        const appState = JSON.parse(process.env.APPSTATE);
        
        login({ appState }, loginOptions, (err, api) => {
            if (err) {
                console.error("❌ Lỗi đăng nhập! Đang tự động kết nối lại sau 15 giây...", err);
                return setTimeout(startBot, 15000); // Tránh spam đăng nhập liên tục khi lỗi
            }

            console.log("🛡️ BOT ĐÃ KHỞI CHẠY DƯỚI CHẾ ĐỘ BẢO MẬT CAO!");

            // 2. Tối ưu cấu hình API chống spam
            api.setOptions({ 
                listenEvents: true, 
                selfListen: false,
                autoMarkAsRead: true // Tự động đọc tin nhắn giống người thật
            });

            api.listenMqtt((err, event) => {
                if (err) {
                    console.error("❌ Lỗi kết nối MQTT, đang thiết lập lại...");
                    return startBot();
                }
                
                // Chuyển tiếp sang handler xử lý
                require('./handler.js')(api, event);
            });
        });
    } catch (e) {
        console.error("❌ Không thể đọc cấu hình APPSTATE. Hãy kiểm tra lại biến môi trường!", e);
    }
}

startBot();
