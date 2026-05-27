const fs = require('fs');
const configPath = './config.json';

module.exports.handle = async function(api, event, command, args, config, sendSafeMessage, getStreamFromURL) {
    const isAdmin = config.ADMIN_IDS.includes(event.senderID);
    
    // Phân quyền: Lệnh admin thì chặn người ngoài, lệnh tiện ích (như avatar) cho phép người đã duyệt dùng
    if (!isAdmin && ["addbox", "delbox", "approve", "remove", "kick", "boxname", "lock", "unlock"].includes(command)) {
        return sendSafeMessage("❌ Bạn không có quyền quản trị viên để sử dụng chức năng này!", event.threadID);
    }

    switch(command) {
        case "avatar": // Chức năng lấy Avatar bằng Graph API chuẩn
            let targetID = Object.keys(event.mentions)[0] || args[0] || event.senderID;
            // API lấy ảnh đại diện trực tiếp qua ID, loại bỏ lỗi tag sai người
            let avtUrl = `https://graph.facebook.com/${targetID}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`; 
            
            const avtStream = await getStreamFromURL(avtUrl);
            if (!avtStream) return sendSafeMessage("❌ Lỗi tải ảnh đại diện từ hệ thống API Facebook!", event.threadID);

            sendSafeMessage({
                body: `📸 Ảnh đại diện của tài khoản [${targetID}] của bạn đây:`,
                attachment: avtStream
            }, event.threadID);
            break;

        case "addbox":
            let boxAdd = args[0] || event.threadID;
            if (!config.ALLOWED_THREAD_IDS.includes(boxAdd)) {
                config.ALLOWED_THREAD_IDS.push(boxAdd);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`✅ Đã thêm ID Box [${boxAdd}] vào danh sách quản lý.`, event.threadID);
            } else {
                sendSafeMessage("💡 ID Box này đã tồn tại trong hệ thống.", event.threadID);
            }
            break;

        case "delbox":
            let boxDel = args[0] || event.threadID;
            const idx = config.ALLOWED_THREAD_IDS.indexOf(boxDel);
            if (idx > -1) {
                config.ALLOWED_THREAD_IDS.splice(idx, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`🚫 Đã loại bỏ ID Box [${boxDel}] khỏi danh sách cấp phép.`, event.threadID);
            }
            break;

        case "approve":
            let targetApprove = Object.keys(event.mentions)[0] || args[0];
            if (!targetApprove) return sendSafeMessage("⚠️ Vui lòng tag hoặc nhập ID người cần duyệt!", event.threadID);
            if (!config.APPROVED_USERS.includes(targetApprove)) {
                config.APPROVED_USERS.push(targetApprove);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`✅ Đã duyệt quyền thành viên VIP cho ID [${targetApprove}].`, event.threadID);
            }
            break;

        case "remove":
            let targetRemove = Object.keys(event.mentions)[0] || args[0];
            if (!targetRemove) return sendSafeMessage("⚠️ Vui lòng tag hoặc nhập ID cần thu hồi!", event.threadID);
            const index = config.APPROVED_USERS.indexOf(targetRemove);
            if (index > -1) {
                config.APPROVED_USERS.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`🚫 Đã thu hồi quyền sử dụng bot của ID [${targetRemove}].`, event.threadID);
            }
            break;

        case "checkbot":
            api.getThreadList(100, null, ["INBOX"], (err, list) => {
                if (err) return sendSafeMessage("❌ Lỗi quét danh sách nhóm!", event.threadID);
                let msg = "📊 DANH SÁCH CÁC BOX CHAT ĐANG CHỨA BOT:\n";
                let count = 1;
                list.forEach(t => { if (t.isGroup) msg += `${count++}. ${t.name || "Không tên"} (ID: ${t.threadID})\n`; });
                sendSafeMessage(msg, event.threadID);
            });
            break;

        case "kick":
            if (Object.keys(event.mentions).length === 0) return sendSafeMessage("⚠️ Hãy tag thành viên cần trục xuất!", event.threadID);
            for (let id in event.mentions) { api.removeUserFromGroup(id, event.threadID); }
            break;

        case "boxname":
            const newName = args.join(" ");
            if (!newName) return sendSafeMessage("⚠️ Nhập tên nhóm mới cần đổi!", event.threadID);
            api.setTitle(newName, event.threadID);
            break;

        case "lock":
            api.setGroupInfo(event.threadID, { approvalMode: true }, () => sendSafeMessage("🔒 Đã kích hoạt phê duyệt thành viên vào nhóm.", event.threadID));
            break;

        case "unlock":
            api.setGroupInfo(event.threadID, { approvalMode: false }, () => sendSafeMessage("🔓 Đã tắt phê duyệt, thành viên tự do ra vào nhóm.", event.threadID));
            break;
    }
};
