const prefix = "/"; // Dấu lệnh của bot (Ví dụ: /help, /boxinfo)
const ADMIN_IDS = ["1000xxxxxxxxx"]; // Thay ID Facebook của bạn (Admin) vào đây

module.exports = function (api, event) {
    // Chỉ xử lý khi có tin nhắn văn bản
    if (event.type !== "message" && event.type !== "message_reply") return;
    if (!event.body) return;

    const { threadID, messageID, senderID, body } = event;
    const args = body.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Hàm gửi tin nhắn nhanh cho đỡ trùng lặp code
    function reply(text) {
        api.sendMessage(text, threadID, messageID);
    }

    // -------------------------------------------------------------
    // CHỨC NĂNG 1: TỰ ĐỘNG TRẢ LỜI KHÔNG CẦN PREFIX (Chatbot thông minh)
    // -------------------------------------------------------------
    const lowerBody = body.toLowerCase();
    if (lowerBody === "hi" || lowerBody === "hello" || lowerBody === "bot ơi") {
        return reply("Chào bạn! Mình là Bot tự động. Gõ /help để xem danh sách lệnh nhé! ❤️");
    }
    if (lowerBody === "vĩnh biệt" || lowerBody === "tạm biệt") {
        return reply("Tạm biệt bạn nhé, hẹn gặp lại! Chúc một ngày tốt lành.");
    }

    // Nếu tin nhắn không bắt đầu bằng dấu lệnh (prefix) thì dừng xử lý lệnh tại đây
    if (!body.startsWith(prefix)) return;

    // Lấy tên lệnh bỏ dấu prefix (Ví dụ: "/help" -> "help")
    const cmd = command.slice(prefix.length);

    // -------------------------------------------------------------
    // CHỨC NĂNG 2: HỆ THỐNG LỆNH TOÀN DIỆN
    // -------------------------------------------------------------
    switch (cmd) {
        
        // --- NHÓM LỆNH HỆ THỐNG & TIỆN ÍCH ---
        case "help":
        case "menu":
            const menuText = 
                "╔═════ MENU BOT MESSENGER ═════╗\n" +
                "ℹ️ [ Tiện ích Hệ Thống ]\n" +
                `  • ${prefix}help : Xem danh sách lệnh\n` +
                `  • ${prefix}ping : Kiểm tra độ phản hồi của bot\n` +
                `  • ${prefix}uid : Xem ID Facebook của bạn\n\n` +
                "👥 [ Quản Lý Nhóm/Box ]\n" +
                `  • ${prefix}boxinfo : Xem thông tin nhóm hiện tại\n` +
                `  • ${prefix}kick @tag : Đuổi thành viên khỏi nhóm\n\n` +
                "🎮 [ Giải Trí & Game ]\n" +
                `  • ${prefix}choose [A] | [B] : Lựa chọn ngẫu nhiên\n` +
                `  • ${prefix}đậpbát : Thử vận may\n\n` +
                "👑 [ Lệnh Cho Quản Trị Viên ]\n" +
                `  • ${prefix}sendto [ID] [Nội dung] : Gửi tin tới nhóm khác\n` +
                "╚═════════════════════════════╝";
            reply(menuText);
            break;

        case "ping":
            const timeStart = Date.now();
            reply("🔄 Đang kiểm tra kết nối...");
            setTimeout(() => {
                const ping = Date.now() - timeStart;
                reply(`📶 Pong! Tốc độ phản hồi: ${ping}ms. Bot vẫn hoạt động mượt mà!`);
            }, 100);
            break;

        case "uid":
            if (event.type === "message_reply") {
                reply(`UID của người được phản hồi: ${event.messageReply.senderID}`);
            } else if (Object.keys(event.mentions).length > 0) {
                let msg = "";
                for (let id in event.mentions) {
                    msg += `${event.mentions[id].replace("@", "")}: ${id}\n`;
                }
                reply(msg.trim());
            } else {
                reply(`UID của bạn là: ${senderID}`);
            }
            break;

        // --- NHÓM LỆNH QUẢN LÝ BOX (NHÓM CHAT) ---
        case "boxinfo":
            api.getThreadInfo(threadID, (err, info) => {
                if (err) return reply("❌ Không thể lấy thông tin nhóm.");
                const msg = 
                    `=== THÔNG TIN BOX ===\n` +
                    `• Tên nhóm: ${info.threadName || "Không tên"}\n` +
                    `• ID Nhóm: ${threadID}\n` +
                    `• Số thành viên: ${info.participantIDs.length}\n` +
                    `• Số quản trị viên: ${info.adminIDs.length}\n` +
                    `• Tổng số tin nhắn: ${info.messageCount}`;
                reply(msg);
            });
            break;

        case "kick":
            // Kiểm tra quyền của Bot trong nhóm trước
            api.getThreadInfo(threadID, (err, info) => {
                if (err) return reply("❌ Lỗi cấu trúc nhóm.");
                const botID = api.getCurrentUserID();
                const isBotAdmin = info.adminIDs.some(item => item.id == botID);
                
                if (!isBotAdmin) return reply("❌ Cấp quyền Quản trị viên cho Bot để sử dụng lệnh này.");

                if (Object.keys(event.mentions).length === 0) return reply("⚠️ Hãy tag người cần kick.");
                
                for (let id in event.mentions) {
                    api.removeUserFromGroup(id, threadID, (err) => {
                        if (err) reply(`❌ Không thể kick thành viên có ID: ${id}`);
                    });
                }
            });
            break;

        // --- NHÓM LỆNH GIẢI TRÍ ---
        case "choose":
            const content = args.join(" ");
            if (!content.includes("|")) return reply(`⚠️ Sai cú pháp. Ví dụ: ${prefix}choose Đi chơi | Ở nhà`);
            const options = content.split("|");
            const choose = options[Math.floor(Math.random() * options.length)].trim();
            reply(`🤔 Theo mình thì bạn nên chọn: 👉 ${choose} 👈`);
            break;

        case "đậpbát":
            const tile = Math.random();
            if (tile > 0.5) {
                reply("💎 Chúc mừng! Bạn đập bát trúng viên Kim Cương trị giá 1000$!");
            } else {
                reply("💥 Rầm... Bạn đập trúng bát hương rồi! Chạy ngay đi!");
            }
            break;

        // --- NHÓM LỆNH ADMIN (Yêu cầu quyền cao nhất) ---
        case "sendto":
            if (!ADMIN_IDS.includes(senderID)) return reply("❌ Bạn không có quyền sử dụng lệnh của Admin.");
            const targetThreadID = args[0];
            const messageToSend = args.slice(1).join(" ");
            
            if (!targetThreadID || !messageToSend) return reply(`⚠️ Cú pháp: ${prefix}sendto [ID Nhóm] [Nội dung]`);
            
            api.sendMessage(`📣 [Thông báo từ Admin]: ${messageToSend}`, targetThreadID, (err) => {
                if (err) return reply("❌ Gửi tin nhắn thất bại. Vui lòng kiểm tra lại ID Nhóm.");
                reply("✅ Đã gửi thông báo thành công!");
            });
            break;

        // --- BÁO LỖI KHI GÕ LỆNH LẠ ---
        default:
            reply(`⚠️ Lệnh "${prefix}${cmd}" không tồn tại. Gõ ${prefix}help để xem các lệnh có sẵn.`);
            break;
    }
};
