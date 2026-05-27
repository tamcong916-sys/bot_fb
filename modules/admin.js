const fs = require('fs');
const configPath = './config.json';

module.exports.handle = async function(api, event, command, args, config, sendSafeMessage) {
    const isAdmin = config.ADMIN_IDS.includes(event.senderID);
    if (!isAdmin) return sendSafeMessage("❌ Bạn không có quyền Quản trị viên để cấu hình hệ thống!", event.threadID);

    switch(command) {
        case "addbox": // Thêm Box hiện tại hoặc ID chỉ định vào danh sách whitelist
            let boxAdd = args[0] || event.threadID;
            if (!config.ALLOWED_THREAD_IDS.includes(boxAdd)) {
                config.ALLOWED_THREAD_IDS.push(boxAdd);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`✅ Đã thêm ID Box [${boxAdd}] vào danh sách quản lý thành công.`, event.threadID);
            } else {
                sendSafeMessage("💡 ID Box này đã tồn tại trong danh sách quản lý.", event.threadID);
            }
            break;

        case "delbox": // Xóa quyền sử dụng bot của Box
            let boxDel = args[0] || event.threadID;
            const idx = config.ALLOWED_THREAD_IDS.indexOf(boxDel);
            if (idx > -1) {
                config.ALLOWED_THREAD_IDS.splice(idx, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`🚫 Đã loại bỏ ID Box [${boxDel}] khỏi danh sách cấp phép.`, event.threadID);
            } else {
                sendSafeMessage("⚠️ Không tìm thấy ID Box này trong danh sách trắng.", event.threadID);
            }
            break;

        case "approve":
            let targetApprove = Object.keys(event.mentions)[0] || args[0];
            if (!targetApprove) return sendSafeMessage("⚠️ Vui lòng tag hoặc nhập ID người cần duyệt!", event.threadID);
            if (!config.APPROVED_USERS.includes(targetApprove)) {
                config.APPROVED_USERS.push(targetApprove);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`✅ Đã duyệt quyền sử dụng cho ID [${targetApprove}].`, event.threadID);
            }
            break;

        case "remove":
            let targetRemove = Object.keys(event.mentions)[0] || args[0];
            if (!targetRemove) return sendSafeMessage("⚠️ Vui lòng tag hoặc nhập ID cần thu hồi quyền!", event.threadID);
            const index = config.APPROVED_USERS.indexOf(targetRemove);
            if (index > -1) {
                config.APPROVED_USERS.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendSafeMessage(`🚫 Đã thu hồi quyền sử dụng bot của ID [${targetRemove}].`, event.threadID);
            }
            break;

        case "checkbot":
            api.getThreadList(100, null, ["INBOX"], (err, list) => {
                if (err) return sendSafeMessage("❌ Lỗi API quét nhóm!", event.threadID);
                let msg = "📊 DANH SÁCH BOX CHAT ĐANG HOẠT ĐỘNG:\n";
                let count = 1;
                list.forEach(t => { if (t.isGroup) msg += `${count++}. ${t.name || "Không tên"} (ID: ${t.threadID})\n`; });
                sendSafeMessage(msg, event.threadID);
            });
            break;

        case "kick":
            if (Object.keys(event.mentions).length === 0) return sendSafeMessage("⚠️ Hãy tag người cần trục xuất!", event.threadID);
            for (let id in event.mentions) { api.removeUserFromGroup(id, event.threadID); }
            break;

        case "boxname":
            const newName = args.join(" ");
            if (!newName) return sendSafeMessage("⚠️ Nhập tên nhóm mới!", event.threadID);
            api.setTitle(newName, event.threadID);
            break;

        case "lock":
            api.setGroupInfo(event.threadID, { approvalMode: true }, () => sendSafeMessage("🔒 Đã bật duyệt thành viên nhóm.", event.threadID));
            break;

        case "unlock":
            api.setGroupInfo(event.threadID, { approvalMode: false }, () => sendSafeMessage("🔓 Đã tắt duyệt thành viên nhóm.", event.threadID));
            break;
    }
};
