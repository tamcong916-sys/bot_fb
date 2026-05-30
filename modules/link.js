const axios = require('axios');

module.exports = {
    name: "link",
    description: "Kết nối Web API để lấy link tải hoặc thông tin dữ liệu",
    run: async function(api, event, args) {
        if (args.length === 0) {
            return api.sendMessage("⚠️ Vui lòng nhập từ khóa hoặc đường link cần xử lý!\nVí dụ: /link tiktok", event.threadID, event.messageID);
        }

        const query = encodeURIComponent(args.join(" "));
        api.sendMessage("⏳ Đang kết nối máy chủ API Web để lấy link rõ hơn, vui lòng đợi...", event.threadID, event.messageID);

        try {
            // Ví dụ kết nối tới một API rút gọn link hoặc lấy link media công khai
            // Bạn có thể thay thế url API của riêng bạn vào đây
            const res = await axios.get(`https://api.microlink.io?url=https://github.com/tamcong916-sys/bot_fb`);
            
            if (res.data && res.data.status === "success") {
                const webTitle = res.data.data.title || "Không có tiêu đề";
                const webUrl = res.data.data.url;
                const logo = res.data.data.logo?.url || "Không có";

                const responseMsg = `🔗 Kết nối Web thành công!\n\n` +
                                    `📝 Tiêu đề: ${webTitle}\n` +
                                    `🌐 Link gốc sạch: ${webUrl}\n` +
                                    `🖼️ Ảnh Logo nguồn: ${logo}`;

                return api.sendMessage(responseMsg, event.threadID, event.messageID);
            } else {
                return api.sendMessage("❌ Máy chủ phản hồi không có dữ liệu hợp lệ.", event.threadID, event.messageID);
            }

        } catch (error) {
            return api.sendMessage(`❌ Không thể kết nối tới Web API. Lỗi: ${error.message}`, event.threadID, event.messageID);
        }
    }
};
