const fs = require('fs');
const axios = require('axios');
const login = require('facebook-chat-api'); 
const config = require('./config.json');

// Cơ chế quản lý FPS / Chống spam lệnh làm chậm bot
const cacheCooldown = new Map();

// Hàm xử lý tải ảnh/GIF tốc độ cao, không bao giờ lo lỗi Stream Attachment
async function getStreamFromURL(url) {
    try {
        const response = await axios({
            method: "GET",
            url: url,
            responseType: "stream"
        });
        return response.data;
    } catch (e) {
        console.error("❌ Lỗi tải Media URL:", e.message);
        return null; // Trả về null để bot tự động bỏ qua attachment chứ không crash code
    }
}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error("❌ Lỗi AppState:", err);

    // Cài đặt cấu hình API tối ưu tốc độ gửi nhận (FPS cực cao)
    api.setOptions({
        listenEvents: true,
        selfListen: false,
        forceLogin: true,
        autoMarkDelivery: true, // Tự động đánh dấu đã nhận giúp giảm độ trễ API
        autoMarkRead: false
    });

    console.clear();
    console.log("==================================================");
    console.log(`[ HỆ THỐNG ] Bot "${config.BOT_NAME}" - Đã Tối Ưu FPS Thành Công.`);
    console.log("==================================================");

    api.listenMqtt(async (err, event) => {
        if (err) return;

        // Tối ưu hóa: Bỏ qua tin nhắn không thuộc phạm vi nhóm được cấp phép (Nếu có cài đặt)
        if (config.ALLOWED_THREAD_IDS.length > 0 && !config.ALLOWED_THREAD_IDS.includes(event.threadID) && event.isGroup) {
            return; 
        }

        // --- SỰ KIỆN: THÀNH VIÊN VÀO NHÓM ---
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const addedParticipants = event.logMessageData.addedParticipants;
            api.getThreadInfo(event.threadID, async (err, threadInfo) => {
                if (err) return;
                const totalMembers = threadInfo.participantIDs.length;

                for (let participant of addedParticipants) {
                    if (participant.userFbId === api.getCurrentUserID()) {
                        api.sendMessage(`[ KẾT NỐI ] Bot đã kích hoạt luồng xử lý tại Box!`, event.threadID);
                        api.changeNickname(config.BOT_NAME, event.threadID, api.getCurrentUserID());
                    } else {
                        const name = participant.fullName;
                        const mediaStream = await getStreamFromURL(config.WELCOME_GIF);
                        
                        const msg = {
                            body: `✨ WELCOME TO BOX ✨\n━━━━━━━━━━━━━━━━━━━\n👋 Xin chào @${name}\n🆔 ID: ${participant.userFbId}\n📊 Thành viên thứ: [ ${totalMembers} ]`,
                            mentions: [{ tag: `@${name}`, id: participant.userFbId }],
                            attachment: mediaStream ? mediaStream : []
                        };
                        
                        setTimeout(() => {
                            api.sendMessage(msg, event.threadID, () => api.sendMessage({ sticker: "369239263222822" }, event.threadID));
                        }, config.DELAY_MESSAGE);
                    }
                }
            });
        }

        // --- SỰ KIỆN: THÀNH VIÊN OUT NHÓM ---
        if (event.type === "event" && event.logMessageType === "log:unsubscribe") {
            const leftID = event.logMessageData.leftParticipantFbId;
            if (leftID !== api.getCurrentUserID()) {
                api.getThreadInfo(event.threadID, (err, threadInfo) => {
                    if (err) return;
                    const remaining = threadInfo.participantIDs.length;
                    api.getUserInfo(leftID, async (err, userInfo) => {
                        if (err) return;
                        const name = userInfo[leftID].name;
                        const mediaStream = await getStreamFromURL(config.LEAVE_GIF);

                        const msg = {
                            body: `🔔 TẠM BIỆT 🔔\n━━━━━━━━━━━━━━━━━━━\n🏃‍♂️ Vĩnh biệt @${name}\n📊 Box hiện tại còn: [ ${remaining} ] thành viên.`,
                            mentions: [{ tag: `@${name}`, id: leftID }],
                            attachment: mediaStream ? mediaStream : []
                        };
                        setTimeout(() => api.sendMessage(msg, event.threadID), config.DELAY_MESSAGE);
                    });
                });
            }
        }

        // --- XỬ LÝ GỌI LỆNH (COMMANDS) ---
        if (event.type === "message" && event.body && event.body.startsWith(config.PREFIX)) {
            const args = event.body.slice(config.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const senderID = event.senderID;

            // Kiểm tra phân quyền cơ bản
            if (!config.ADMIN_IDS.includes(senderID) && !config.APPROVED_USERS.includes(senderID)) {
                return api.sendMessage("⚠️ Bạn không có quyền hạn kích hoạt module này!", event.threadID, event.messageID);
            }

            // Bộ lọc FPS / Chống spam lệnh liên tục (Gây nghẽn API)
            if (cacheCooldown.has(senderID)) {
                const timePassed = Date.now() - cacheCooldown.get(senderID);
                if (timePassed < config.ANTI_SPAM_COOLDOWN) {
                    return; // Chặn cuộc gọi liên tiếp quá nhanh, giữ FPS ổn định
                }
            }
            cacheCooldown.set(senderID, Date.now());

            // Hàm gửi tin nhắn tích hợp sẵn cơ chế chống lỗi / Delay an toàn
            const sendSafeMessage = async (msgData, thread) => {
                // Nếu msgData là chuỗi text thông thường, tự động chuẩn hóa cấu hình gửi
                let finalMsg = typeof msgData === "string" ? { body: msgData } : msgData;
                setTimeout(() => {
                    api.sendMessage(finalMsg, thread, (error) => {
                        if (error) console.error("❌ Phát hiện lỗi API gửi tin nhắn, hệ thống tự động bỏ qua để tránh nghẽn luồng.");
                    }, event.messageID);
                }, config.DELAY_MESSAGE);
            };

            // Điều phối Hộp thư
            try {
                if (command === "menu") return require('./modules/hethong.js').menu(api, event, config, sendSafeMessage, getStreamFromURL);
                if (["kick", "lock", "unlock", "boxname", "checkbot", "approve", "remove", "addbox", "delbox"].includes(command)) {
                    return require('./modules/admin.js').handle(api, event, command, args, config, sendSafeMessage);
                }
                if (command === "taixiu") return require('./modules/game.js').taixiu(api, event, args, sendSafeMessage);
            } catch (err) {
                console.error(`❌ Lỗi thực thi lệnh [${command}]:`, err.message);
            }
        }
    });
});
