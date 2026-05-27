const fs = require('fs');

module.exports.handle = async function(api, event, command, args, config, sendDelayedMessage) {
    const isAdmin = config.ADMIN_IDS.includes(event.senderID);

    // BẢO VỆ CHẶT CHẼ: Thành viên thường (dù đã được duyệt) cố tình gọi lệnh admin sẽ bị từ chối
    if (!isAdmin) {
        return sendDelayedMessage("❌ Quyền lực từ chối! Bạn chỉ có quyền sử dụng bot để giải trí, không thể dùng chức năng của Quản Trị Viên.", event.threadID);
    }

    const configPath = './config.json';

    switch(command) {
        case "approve": // Thêm quyền sử dụng Bot cho thành viên mới
            let targetApprove = Object.keys(event.mentions)[0] || args[0];
            if (!targetApprove) return sendDelayedMessage("⚠️ Vui lòng tag hoặc nhập ID người cần phê duyệt!", event.threadID);

            if (!config.APPROVED_USERS.includes(targetApprove)) {
                config.APPROVED_USERS.push(targetApprove);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendDelayedMessage(`✅ Đã phê duyệt thành công ID [${targetApprove}]. Người này hiện đã có thể trải nghiệm các tính năng của Bot.`, event.threadID);
            } else {
                sendDelayedMessage("💡 Người dùng này đã được cấp quyền từ trước rồi.", event.threadID);
            }
            break;

        case "remove": // Thu hồi quyền sử dụng Bot
            let targetRemove = Object.keys(event.mentions)[0] || args[0];
            if (!targetRemove) return sendDelayedMessage("⚠️ Vui lòng tag hoặc nhập ID người cần thu hồi quyền!", event.threadID);

            const index = config.APPROVED_USERS.indexOf(targetRemove);
            if (index > -1) {
                config.APPROVED_USERS.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
                sendDelayedMessage(`🚫 Đã thu hồi quyền sử dụng Bot của ID [${targetRemove}]. Người này không thể tương tác với bot nữa.`, event.threadID);
            } else {
                sendDelayedMessage("⚠️ ID này chưa từng được phê duyệt hoặc không tồn tại trong danh sách.", event.threadID);
            }
            break;

        case "checkbot":
            api.getThreadList(100, null, ["INBOX"], (err, list) => {
                if (err) return sendDelayedMessage("❌ Không thể quét danh sách nhóm!", event.threadID);
                let msg = "📊 DANH SÁCH CÁC BOX CHAT ĐANG CHỨA BOT:\n";
                let count = 1;
                list.forEach(t => { if (t.isGroup) msg += `${count++}. ${t.name || "Không tên"} (ID: ${t.threadID})\n`; });
                sendDelayedMessage(msg, event.threadID);
            });
            break;

        case "kick":
            if (Object.keys(event.mentions).length === 0) return sendDelayedMessage("⚠️ Hãy tag người cần trục xuất!", event.threadID);
            for (let id in event.mentions) { api.removeUserFromGroup(id, event.threadID); }
            break;

        case "boxname":
            const newName = args.join(" ");
            if (!newName) return sendDelayedMessage("⚠️ Nhập tên nhóm mới!", event.threadID);
            api.setTitle(newName, event.threadID);
            break;

        case "lock":
            api.setGroupInfo(event.threadID, { approvalMode: true }, (err) => {
                if(err) return sendDelayedMessage("❌ Thất bại!", event.threadID);
                sendDelayedMessage("🔒 Đã kích hoạt chế độ phê duyệt thành viên vào nhóm.", event.threadID);
            });
            break;

        case "unlock":
            api.setGroupInfo(event.threadID, { approvalMode: false }, (err) => {
                if(err) return sendDelayedMessage("❌ Thất bại!", event.threadID);
                sendDelayedMessage("🔓 Đã tắt chế độ phê duyệt nhóm thành công.", event.threadID);
            });
            break;
    }
};
