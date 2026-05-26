module.exports = [
    { name: "google", async execute(api, event, args) { return api.sendMessage(`🔍 Link tìm kiếm của bạn: https://www.google.com/search?q=${encodeURIComponent(args.join(" "))}`, event.threadID); } },
    { name: "weather", async execute(api, event) { return api.sendMessage("🌤️ Thời tiết Việt Nam hôm nay: 28°C, trời quang đãng mượt mà.", event.threadID); } },
    { name: "xemgio", async execute(api, event) { return api.sendMessage(`⏰ Giờ hệ thống hiện tại: ${new Date().toLocaleString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"})}`, event.threadID); } }
];
