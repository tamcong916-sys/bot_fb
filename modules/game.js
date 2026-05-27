module.exports.taixiu = function(api, event, args) {
    const cuoc = args[0]?.toLowerCase();
    const tienCuoc = parseInt(args[1]);

    if (!cuoc || !["tai", "xiu"].includes(cuoc)) {
        return api.sendMessage("🎲 Cách chơi: /taixiu [tai/xiu] [số tiền]", event.threadID);
    }

    // Lắc 3 xúc xắc
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    const tong = d1 + d2 + d3;
    const ketQua = (tong >= 11 && tong <= 17) ? "tai" : "xiu";

    let iconXucXac = (n) => ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][n-1];

    let message = `╔════ 🎲 TÀI XỈU 🎲 ════╗\n`;
    message += `┣ Lắc xúc xắc: ${iconXucXac(d1)}  ${iconXucXac(d2)}  ${iconXucXac(d3)}\n`;
    message += `┣ Tổng điểm: ${tong} => ${ketQua.toUpperCase()}\n`;
    message += `╠═════════════════════╣\n`;

    if (cuoc === ketQua) {
        message += `🎉 Bạn đã THẮNG! Nhận ngay phần thưởng xứng đáng.`;
    } else {
        message += `💸 Bạn đã THUA! May mắn lần sau nhé bạn hiền.`;
    }
    message += `\n╚═════════════════════╝`;

    return api.sendMessage(message, event.threadID);
};
