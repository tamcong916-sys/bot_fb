module.exports = [
    { name: "kick", async execute(api, event, args) { let id = Object.keys(event.mentions)[0] || args[0]; if(!id) return; api.removeUserFromGroup(id, event.threadID); } },
    { name: "sendmsg", async execute(api, event, args) { return api.sendMessage(`📢 Thông báo từ Admin: ${args.join(" ")}`, event.threadID); } },
    { name: "restart", async execute(api, event) { await api.sendMessage("🔄 Hệ thống đang tiến hành khởi động lại...", event.threadID); process.exit(1); } }
];
