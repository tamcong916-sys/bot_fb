const fs = require('fs');
const login = require('facebook-chat-api'); 
const config = require('./config.json');

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    console.clear();
    console.log("==================================================");
    console.log(`[ HỆ THỐNG ] Bot "${config.BOT_NAME}" đã sẵn sàng.`);
    console.log("==================================================");

    api.listenMqtt(async (err, event) => {
        if (err) return;

        // --- SỰ KIỆN KHÁC (TỰ ĐỘNG CHÀO VÀ ĐỔI BIỆT DANH) ---
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const addedParticipants = event.logMessageData.addedParticipants;
            for (let participant of addedParticipants) {
                if (participant.userFbId === api.getCurrentUserID()) {
                    api.sendMessage(`[ KẾT NỐI ] Bot đã vào nhóm!`, event.threadID);
                    api.changeNickname(config.BOT_NAME, event.threadID, api.getCurrentUserID());
                } else {
                    const name = participant.fullName;
                    api.sendMessage({
                        body: `Chào mừng @${name} đã vào nhóm! ✨`,
                        mentions: [{ tag: `@${name}`, id: participant.userFbId }]
                    }, event.threadID, () => {
                        api.sendMessage({ sticker: "369239263222822" }, event.threadID);
                    });
                }
            }
        }

        // --- XỬ LÝ LỆNH CHAT CHÍNH THỨC ---
        if (event.type === "message" && event.body && event.body.startsWith(config.PREFIX)) {
            const args = event.body.slice(config.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const senderID = event.senderID;

            // 1. KIỂM TRA QUYỀN SỬ DỤNG BOT (Phân quyền tầng ngoài)
            const isAdmin = config.ADMIN_IDS.includes(senderID);
            const isApproved = config.APPROVED_USERS.includes(senderID);

            if (!isAdmin && !isApproved) {
                return api.sendMessage("⚠️ Bạn không thể sài bot này khi không có quyền từ admin. Vui lòng liên hệ Admin để được phê duyệt!", event.threadID, event.messageID);
            }

            // 2. TẠO HÀM GỬI TIN NHẮN CÓ DELAY THEO CONFIG
            const sendDelayedMessage = (msgData, thread) => {
                setTimeout(() => {
                    api.sendMessage(msgData, thread, event.messageID);
                }, config.DELAY_MESSAGE || 1000); 
            };

            // 3. ĐIỀU HƯỚNG MODULE CHỨC NĂNG
            if (command === "menu") {
                return require('./modules/hethong.js').menu(api, event, config, sendDelayedMessage);
            }
            if (["kick", "lock", "unlock", "boxname", "checkbot", "approve", "remove"].includes(command)) {
                return require('./modules/admin.js').handle(api, event, command, args, config, sendDelayedMessage);
            }
            if (command === "taixiu") {
                return require('./modules/game.js').taixiu(api, event, args, sendDelayedMessage);
            }
        }
    });
});
