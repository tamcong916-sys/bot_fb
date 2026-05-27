// Giả lập hệ thống lưu trữ tiền tệ đơn giản (Nếu bot bạn chưa có file data người dùng)
// Bạn có thể thay đổi cách lấy/cộng tiền để phù hợp với framework bot của bạn (ví dụ: Currencies.increaseMoney)
const fs = require('fs');
const path = __dirname + '/taixiu_data.json';
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));

module.exports.taixiu = async function(api, event, args) {
    const { threadID, messageID, senderID } = event;
    
    // 1. Kiểm tra cú pháp đầu vào
    const cuoc = args[0]?.toLowerCase();
    const tienCuoc = parseInt(args[1]);

    if (!cuoc || !["tai", "xiu"].includes(cuoc) || isNaN(tienCuoc) || tienCuoc <= 0) {
        return api.sendMessage(
            "✨ [ TÀI XỈU CASINO VIP ] ✨\n" +
            "───────────────────\n" +
            "📝 Hướng dẫn đặt cược:\n" +
            "👉 /taixiu [tai/xiu] [Số tiền cược]\n" +
            "💡 Ví dụ: /taixiu tai 50000", 
            threadID, messageID
        );
    }

    // 2. Xử lý số dư tài khoản (Đọc từ file data giả lập)
    let userData = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!userData[senderID]) userData[senderID] = 100000; // Tặng 100k cho người mới chơi lần đầu

    if (userData[senderID] < tienCuoc) {
        return api.sendMessage(`⚠️ [ VIP CASINO ] Số dư tài khoản không đủ! Bạn hiện có: ${userData[senderID].toLocaleString()} $`, threadID, messageID);
    }

    // 3. Gửi hiệu ứng đang lắc xúc xắc (Tạo cảm giác hồi hộp VIP)
    api.sendMessage("✨ [ CASINO ] Đang lắc xúc xắc, vui lòng đợi trong giây lát... 🎲✨", threadID, async (err, info) => {
        if (err) return;

        // Hoãn 2.5 giây để tạo hiệu ứng như sòng bài thật
        setTimeout(() => {
            // Lắc 3 xúc xắc ngẫu nhiên
            const d1 = Math.floor(Math.random() * 6) + 1;
            const d2 = Math.floor(Math.random() * 6) + 1;
            const d3 = Math.floor(Math.random() * 6) + 1;
            const tong = d1 + d2 + d3;
            
            // Xác định kết quả và luật phụ (3 viên trùng nhau = Nhà cái ăn hết)
            let ketQua = "";
            let laBao = false;

            if (d1 === d2 && d2 === d3) {
                ketQua = "BAO"; // Bộ ba đồng nhất (Tam bảo)
                laBao = true;
            } else {
                ketQua = (tong >= 11 && tong <= 17) ? "tai" : "xiu";
            }

            const iconXucXac = (n) => ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n-1];
            
            // 4. Kiểm tra Thắng / Thua và cập nhật lại số dư tiền
            let thang = false;
            let msgKetQua = "";

            if (laBao) {
                thang = false;
                userData[senderID] -= tienCuoc;
                msgKetQua = `💥 BÃO ${d1}! Nhà cái hốt trọn gói tài xỉu!`;
            } else if (cuoc === ketQua) {
                thang = true;
                userData[senderID] += tienCuoc; // Ăn 1:1
                msgKetQua = `🎉 THẮNG LỚN! +${tienCuoc.toLocaleString()} $`;
            } else {
                thang = false;
                userData[senderID] -= tienCuoc;
                msgKetQua = `💸 THUA CUỘC! -${tienCuoc.toLocaleString()} $`;
            }

            // Lưu lại số dư mới vào file data
            fs.writeFileSync(path, JSON.stringify(userData, null, 4));

            // 5. Thiết kế giao diện kết quả Siêu VIP
            let replyMsg = 
`⚜️ 💎 𝕃𝕌𝕏𝕌ℝ𝕐 ℂ𝔸𝕊𝕀ℕ𝕆 💎 ⚜️
─────────────────────
[👤] Khách hàng:  @${event.senderID} (Đã đặt: ${cuoc.toUpperCase()})
[💵] Tiền cược:    ${tienCuoc.toLocaleString()} $

🎲 Kết quả lắc:   ${iconXucXac(d1)}  ${iconXucXac(d2)}  ${iconXucXac(d3)}
📊 Tổng số điểm:  ${tong} nút ➔ [ ${ketQua.toUpperCase()} ]
─────────────────────
🏆 KẾT QUẢ CƯỢC:
👉 ${msgKetQua}

💰 Số dư ví VIP hiện tại: ${userData[senderID].toLocaleString()} $
─────────────────────
🎰 Chúc quý khách may mắn lần sau!`;

            // Gửi đè / Phản hồi lại tin nhắn kèm Tag người chơi chuẩn
            api.sendMessage({
                body: replyMsg,
                mentions: [{ tag: `@${event.senderID}`, id: senderID }]
            }, threadID, () => {
                // Xóa tin nhắn "Đang lắc..." lúc nãy cho box chat gọn đẹp
                api.unsendMessage(info.messageID);
            }, messageID);

        }, 2500); // 2500 ms = Đợi 2.5 giây
    });
};
