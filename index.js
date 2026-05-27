// --- SỰ KIỆN XỬ LÝ KHI CÓ THÀNH VIÊN RỜI NHÓM HOẶC BỊ KICK ---
if (event.type === "event" && event.logMessageType === "log:unsubscribe") {
    const leftParticipantID = event.logMessageData.leftParticipantFbId; // ID người rời nhóm

    // Nếu người rời nhóm chính là Bot thì không cần tự chào tạm biệt mình
    if (leftParticipantID !== api.getCurrentUserID()) {
        
        // Lấy thông tin nhóm để cập nhật lại số lượng thành viên còn lại
        api.getThreadInfo(event.threadID, async (err, threadInfo) => {
            if (err) return console.error("❌ Lỗi lấy thông tin nhóm khi có người out:", err);
            
            const remainingMembers = threadInfo.participantIDs.length; // Số thành viên còn lại
            
            // Lấy tên của người vừa out nhóm để tag cho chuẩn
            api.getUserInfo(leftParticipantID, async (err, userInfo) => {
                if (err) return console.error("❌ Lỗi lấy thông tin người dùng:", err);
                
                const name = userInfo[leftParticipantID].name;

                // Thiết kế giao diện thông báo thành viên rời nhóm Siêu Đẹp
                const leaveText = 
`🔔 THÀNH VIÊN RỜI NHÓM 🔔
━━━━━━━━━━━━━━━━━━━
[📸] Ảnh tạm biệt đang tải phía trên...

🏃‍♂️ Vĩnh biệt @${name}
🆔 ID Facebook: ${leftParticipantID}
📊 Nhóm hiện tại còn lại: [ ${remainingMembers} ] thành viên.

Hy vọng sẽ được gặp lại bạn vào một ngày không xa! 🕊️`;

                // Cấu hình tin nhắn gồm lời nhắn, thẻ tag chuẩn 100% và ảnh GIF ở phía trên
                const msgData = {
                    body: leaveText,
                    mentions: [{
                        tag: `@${name}`,
                        id: leftParticipantID
                    }],
                    attachment: await global.utils.getStreamFromURL(config.LEAVE_GIF) // Gọi ảnh GIF tạm biệt từ config
                };

                // Gửi tin nhắn có delay nhẹ theo cấu hình hệ thống để tránh spam Facebook
                setTimeout(() => {
                    api.sendMessage(msgData, event.threadID);
                }, config.DELAY_MESSAGE || 1500);
            });
        });
    }
}
