const fs = require('fs');
const path = require('path');
const prefix = process.env.PREFIX || "/";

// Tự động load tất cả các file lệnh trong thư mục modules
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, 'modules')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./modules/${file}`);
    if (command.name) commands.set(command.name, command);
}

module.exports = async function(api, event) {
    if (event.type !== "message" || !event.body) return;

    const body = event.body.trim();
    if (!body.startsWith(prefix)) return;

    const args = body.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commands.has(commandName)) {
        const command = commands.get(commandName);

        // Hiệu ứng giả lập đang gõ chữ siêu bảo mật
        api.sendTypingIndicator(event.threadID);

        try {
            // Thực thi lệnh từ thư mục modules
            await command.run(api, event, args);
        } catch (error) {
            console.error(`Lỗi khi chạy lệnh ${commandName}:`, error);
            api.sendMessage(`❌ Đã xảy ra lỗi khi thực thi lệnh này!`, event.threadID, event.messageID);
        }
    }
};
