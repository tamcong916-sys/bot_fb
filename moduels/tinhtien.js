module.exports = [
    { name: "daily", async execute(api, event) { return api.sendMessage("🎁 Bạn đã nhận $200 điểm danh hằng ngày!", event.threadID); } },
    { name: "work", async execute(api, event) { const jobs = ["sửa xe", "bán cá", "viết code bot"]; return api.sendMessage(`💼 Bạn làm nghề [${jobs[Math.floor(Math.random()*3)]}] và kiếm được $${Math.floor(Math.random()*100)+50}!`, event.threadID); } },
    { name: "checkmoney", async execute(api, event) { return api.sendMessage("💰 Số dư tài khoản ảo của bạn hiện có: $15,000", event.threadID); } }
];
