const fs = require('fs');
const login = require('facebook-chat-api'); // Hoặc thư viện fca bạn đang dùng
const config = require('./config.json');

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    // --- HIỂN THỊ DANH SÁCH MODULES MƯỢT MÀ KHI CHẠY ---
    console.clear();
    console.log("==================================================");
    console.log(`[ HỆ THỐNG ] Bot "${config.BOT_NAME}" đang khởi động...`);
    const modules = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));
    console.log(`[ MODULES ] Đã tải thành công ${modules.length} hộp thư chức năng:`);
    modules.forEach(m => console.log(`  ├──> SUCCESS: ${m}`));
    console.log("==================================================");

    api.listenMqtt(async (err, event) => {
        if (err) return;

        // --- 1. XỬ LÝ SỰ KIỆN THAY ĐỔI THÀNH VIÊN (LOG EVENT) ---
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const addedParticipants = event.logMessageData.addedParticipants;
            
            for (let participant of addedParticipants) {
                // Nếu Bot là người được add vào nhóm
                if (participant.userFbId === api.getCurrentUserID()) {
                    // Gửi tin nhắn thông báo thành công
                    api.sendMessage(`[ KẾT NỐI ] Bot đã tham gia nhóm thành công! Xin chào mọi người.`, event.threadID);
                    
                    // Tự động đổi biệt danh của Bot theo config.json
                    api.changeNickname(config.BOT_NAME, event.threadID, api.getCurrentUserID());
                } 
                // Nếu là thành viên khác tham gia nhóm
                else {
                    const name = participant.fullName;
                    const id = participant.userFbId;
                    
                    // Gửi lời chào kèm TAG chuẩn không lỗi thông báo
                    const msg = {
                        body: `Chào mừng @${name} đã tham gia vào nhóm! Chúc bạn có khoảng thời gian vui vẻ tại đây.`,
                        mentions: [{
                            tag: `@${name}`,
                            id: id
                        }]
                    };
                    
                    api.sendMessage(msg, event.threadID, (err, info) => {
                        // Gửi thêm sticker sau khi chào (Thay ID sticker đẹp tùy ý bạn)
                        if (!err) api.sendMessage({ sticker: "369239263222822" }, event.threadID);
                    });
                }
            }
        }

        // --- 2. XỬ LÝ LỆNH CHAT (COMMANDS) ---
        if (event.type === "message" && event.body && event.body.startsWith(config.PREFIX)) {
            const args = event.body.slice(config.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // Gọi các module xử lý (Ví dụ minh họa điều hướng hộp thư)
            if (command === "menu") return require('./modules/hethong.js').menu(api, event, config);
            if (["kick", "lock", "unlock", "boxname", "checkbot"].includes(command)) {
                return require('./modules/admin.js').handle(api, event, command, args, config);
            }
            if (command === "taixiu") return require('./modules/game.js').taixiu(api, event, args);
        }
    });
});
