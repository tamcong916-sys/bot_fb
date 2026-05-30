require('dotenv').config();
const login = require("fca-unofficial");

const loginOptions = {
    forceLogin: true,
    listenEvents: true,
    selfListen: false,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
};

function startBot() {
    try {
        const appState = JSON.parse(process.env.APPSTATE);
        
        login({ appState }, loginOptions, (err, api) => {
            if (err) {
                console.error("❌ Lỗi đăng nhập, đang thử lại sau 10 giây...", err);
                return setTimeout(startBot, 10000);
            }

            console.log("██████████████████████████████████████████");
            console.log("► BOT ĐÃ KHỞI CHẠY THÀNH CÔNG VÀ BẢO MẬT AN TOÀN!");
            console.log("██████████████████████████████████████████");

            api.setOptions({ listenEvents: true, selfListen: false });

            api.listenMqtt((err, event) => {
                if (err) {
                    console.error("❌ Lỗi MQTT:", err);
                    return startBot(); // Tự động kết nối lại nếu rớt mạng
                }
                
                // Truyền dữ liệu sang handler để xử lý
                require('./handler.js')(api, event);
            });
        });
    } catch (e) {
        console.error("❌ Chuỗi APPSTATE trong file .env bị lỗi định dạng!", e);
    }
}

startBot();
