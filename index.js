
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const login = require('@dongdev/fca-unofficial');

const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('<h3>Bot Premium VIP 2026 đang vận hành 24/7!</h3>'));
app.listen(PORT, () => console.log(`[SERVER] Đang chạy trên cổng: ${PORT}`));

const config = fs.readJsonSync('./config.json');
const client = {
    commands: new Map(),
    config: config,
    cooldowns: new Map()
};

// Quét toàn bộ 9 file hộp thư trong thư mục modules
const modulesPath = path.join(__dirname, 'modules');
if (fs.existsSync(modulesPath)) {
    const files = fs.readdirSync(modulesPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        const moduleCommands = require(path.join(modulesPath, file));
        for (const cmd of moduleCommands) {
            client.commands.set(cmd.name, cmd);
        }
    }
}
console.log(`[HỆ THỐNG] Đã tải thành công 9 hộp thư với tổng cộng ${client.commands.size} chức năng.`);

const appState = fs.readJsonSync('./appstate.json');
login({ appState }, (err, api) => {
    if (err) return console.error("❌ Lỗi AppState:", err);
    api.setOptions({ listenEvents: true, selfListen: false, autoMarkRead: true });
    console.log("✅ BOT PREMIUM ĐÃ ONLINE TRÊN RENDER!");

    api.listenMqtt((err, event) => {
        if (err) return;
        if (event.type === "message" || event.type === "message_reply") onMessage(api, event);
    });
});

async function onMessage(api, messageEvent) {
    const { body, threadID, senderID, messageID } = messageEvent;
    if (!body || !body.startsWith(config.prefix)) return;

    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName);

    // ⏱️ HỆ THỐNG KIỂM TRA ĐỢI ĐÚNG 10 GIÂY MỚI ĐƯỢC CHẠY TIẾP
    const checkCooldown = command.name === "menu" ? 10 : (command.cooldown || 2);
    if (!client.cooldowns.has(commandName)) client.cooldowns.set(commandName, new Map());
    const now = Date.now();
    const timestamps = client.cooldowns.get(commandName);
    const cooldownAmount = checkCooldown * 1000;

    if (timestamps.has(senderID)) {
        const expirationTime = timestamps.get(senderID) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = Math.ceil((expirationTime - now) / 1000);
            return api.sendMessage(`⚠️ Chống spam nhóm! Vui lòng chờ sau ${timeLeft} giây để tiếp tục sử dụng lệnh [${commandName}].`, threadID, messageID);
        }
    }
    timestamps.set(senderID, now);

    try {
        // 🛡️ ANTI-BAN AUTO SEND TYPING INDICATOR
        api.sendTypingIndicator(true, threadID);
        await new Promise(res => setTimeout(res, 1000));
        await command.execute(api, messageEvent, args, client);
    } catch (error) {
        api.sendMessage(`❌ Lỗi thực thi lệnh.`, threadID, messageID);
    }
}
