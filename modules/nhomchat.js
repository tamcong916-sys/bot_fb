module.exports = [
    { name: "rule", async execute(api, event) { return api.sendMessage("📜 NỘI QUY: Không spam lệnh bot, không văng tục xúc phạm thành viên.", event.threadID); } },
    { name: "warn", async execute(api, event) { return api.sendMessage("⚠️ Thành viên đã bị cảnh cáo 1 lần vi phạm!", event.threadID); } },
    { name: "unwarn", async execute(api, event) { return api.sendMessage("✅ Đã gỡ bỏ phiếu cảnh cáo vi phạm.", event.threadID); } },
    { name: "banlist", async execute(api, event) { return api.sendMessage("🚫 Danh sách đen của Box: Hiện tại trống rỗng.", event.threadID); } }
];
