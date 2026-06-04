const fs = require('fs');
const path = require('path');

const COOKIE_PATH = path.join(__dirname, 'secure_cookie.json');

module.exports = {
    // Lấy AppState từ Cookie lưu trữ
    getAppState: function() {
        if (!fs.existsSync(COOKIE_PATH)) {
            // Nếu chưa có file, tạo file rỗng để người dùng nhập vào
            fs.writeFileSync(COOKIE_PATH, JSON.stringify({ cookie_string: "NHẬP_COOKIE_CỦA_BẠN_VÀO_ĐÂY" }, null, 4));
            console.log(`⚠️ [SECURITY] Đã tạo file secure_cookie.json. Hãy dán Cookie vào đó rồi khởi động lại!`);
            process.exit(0);
        }

        const rawData = fs.readFileSync(COOKIE_PATH, 'utf-8');
        const data = JSON.parse(rawData);

        if (!data.cookie_string || data.cookie_string.includes("NHẬP_COOKIE")) {
            console.error("❌ [SECURITY] Chưa cấu hình Cookie trong file secure_cookie.json!");
            process.exit(0);
        }

        return this.parseCookieToAppState(data.cookie_string);
    },

    // Hàm chuyển đổi định dạng Chuỗi Cookie sang AppState của FCA
    parseCookieToAppState: function(cookieString) {
        const appState = [];
        const pairs = cookieString.split(';');
        
        pairs.forEach(pair => {
            const index = pair.indexOf('=');
            if (index === -1) return;
            
            const key = pair.substr(0, index).trim();
            const value = pair.substr(index + 1).trim();
            
            // Các trường quan trọng bắt buộc phải có để tránh checkpoint
            if (key) {
                appState.push({
                    key: key,
                    value: value,
                    domain: "facebook.com",
                    path: "/",
                    hostOnly: false,
                    creation: new Date().toISOString(),
                    lastAccessed: new Date().toISOString()
                });
            }
        });
        return appState;
    },

    // Lưu lại AppState mới khi Facebook tự động cập nhật / làm tươi session
    saveAppState: function(newAppState) {
        try {
            // Chuyển ngược từ AppState về dạng Cookie string gọn gàng bảo mật
            const cookieString = newAppState.map(c => `${c.key}=${c.value}`).join('; ');
            fs.writeFileSync(COOKIE_PATH, JSON.stringify({ cookie_string: cookieString }, null, 4));
            console.log("🔒 [SECURITY] Đã đồng bộ và làm tươi (Refresh) Cookie bảo mật thành công!");
        } catch (error) {
            console.error("❌ Lỗi ghi đè Cookie bảo mật:", error);
        }
    }
};
