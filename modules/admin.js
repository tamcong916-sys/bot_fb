module.exports.handle = async function(api, event, command, args, config) {
    const isAdmin = config.ADMIN_IDS.includes(event.senderID);

    // Kiểm tra quyền Admin chung cho nhóm chức năng này
    if (!isAdmin) {
        return api.sendMessage("⚠️ Bạn không có quyền sử dụng chức năng Admin này!", event.threadID);
    }

    switch(command) {
        case "checkbot": // Quét xem bot đang ở những nhóm nào
            api.getThreadList(100, null, ["INBOX"], (err, list) => {
                if (err) return api.sendMessage("❌ Lỗi quét danh sách nhóm!", event.threadID);
                let msg = "📊 DANH SÁCH NHÓM BOT ĐANG THAM GIA:\n";
                let count = 1;
                list.forEach(t => {
                    if (t.isGroup) {
                        msg += `${count++}. ${t.name || "Không tên"} (ID: ${t.threadID})\n`;
                    }
                });
                api.sendMessage(msg, event.threadID);
            });
            break;

        case "kick": // Kick thành viên
            if (Object.keys(event.mentions).length === 0) {
                return api.sendMessage("⚠️ Hãy tag người cần kick!", event.threadID);
            }
            for (let id in event.mentions) {
                api.removeUserFromGroup(id, event.threadID);
            }
            break;

        case "boxname": // Đổi tên nhóm
            const newName = args.join(" ");
            if (!newName) return api.sendMessage("⚠️ Nhập tên nhóm mới cần đổi!", event.threadID);
            api.setTitle(newName, event.threadID);
            break;

        case "lock": // Khóa duyệt thành viên vào nhóm
            api.setGroupInfo(event.threadID, { approvalMode: true }, (err) => {
                if(err) return api.sendMessage("❌ Không thể bật chế độ duyệt!", event.threadID);
                api.sendMessage("🔒 Đã BẬT chế độ phê duyệt thành viên mới.", event.threadID);
            });
            break;

        case "unlock": // Mở khóa duyệt thành viên
            api.setGroupInfo(event.threadID, { approvalMode: false }, (err) => {
                if(err) return api.sendMessage("❌ Không thể tắt chế độ duyệt!", event.threadID);
                api.sendMessage("🔓 Đã TẮT chế độ phê duyệt (Tự do ra vào).", event.threadID);
            });
            break;
            
        case "avatar": // Sửa lỗi lấy đúng avatar bằng ID Facebook tránh lỗi tag sai người
            let targetID = Object.keys(event.mentions)[0] || event.senderID;
            // API chuẩn lấy avatar chất lượng cao qua ID trực tiếp không sợ bị lệch tag
            let avtUrl = `https://graph.facebook.com/${targetID}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`; 
            // Bạn có thể gửi link này hoặc tải stream gửi về nhóm
            api.sendMessage({ body: `Avatar của người dùng:`, attachment: await global.utils.getStreamFromURL(avtUrl)}, event.threadID);
            break;
    }
};
