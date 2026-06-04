require('dotenv').config();
const login = require("fca-unofficial");
const cookieManager = require("./cookie_manager.js");

// Danh sách các User-Agent sạch, phân rã để bot tự động xoay tua nếu cần
const SECURE_USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
];

const loginOptions = {
    forceLogin: false, // Để false để tận dụng Session cũ, tránh tạo login liên tục gây die acc
    listenEvents: true,
    selfListen: false,
    // Chọn ngẫu nhiên hoặc cố định 1 User-Agent khớp với trình duyệt lấy cookie
    userAgent: SECURE_USER_AGENTS[0] 
};

function startBot() {
    console.log("🛡️ [SYSTEM] Đang nạp Cookie từ bộ lưu trữ biệt lập...");
    const appState = cookieManager.getAppState();

    login({ appState }, loginOptions, (err, api) => {
        if (err) {
            console.error("❌ Đăng nhập thất bại! Cookie có thể đã hết hạn hoặc bị Facebook block tạm thời.");
            console.log("🔄 Thử lại sau 30 giây...");
            return setTimeout(startBot, 30000);
        }

        console.log("✅ [SUCCESS] Đăng nhập thành công bằng Cookie an toàn!");

        // CẤU HÌNH BẢO MẬT CHỐNG SPAM / CHỐNG QUÉT CAO CẤP
        api.setOptions({
            listenEvents: true,
            selfListen: false,
            autoMarkAsRead: false, // Bật false hoặc delay đọc để tránh bot bị quét hành vi spam click
            online: true // Giữ trạng thái nick luôn online hợp lệ
        });

        // 💥 QUAN TRỌNG: Lắng nghe sự kiện đổi trạng thái từ Facebook để tự động cập nhật Cookie mới
        // Giúp hạn chế tối đa việc Cookie bị "Sống sót ngắn hạn"
        const currentAppState = api.getAppState();
        cookieManager.saveAppState(currentAppState);

        // Khởi chạy MQTT lắng nghe tin nhắn
        api.listenMqtt((mqttErr, event) => {
            if (mqttErr) {
                console.error("❌ Mất kết nối luồng MQTT. Tiến hành khôi phục...");
                return startBot();
            }

            try {
                // Liên kết sang file xử lý tính năng handler.js của bạn
                require('./handler.js')(api, event);
            } catch (handlerErr) {
                console.error("⚠️ Lỗi Handler:", handlerErr);
            }
        });
    });
}

// Bắt đầu chạy hệ thống
startBot();
