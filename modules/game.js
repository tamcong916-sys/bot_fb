module.exports = [
    {
        name: "taixiu",
        async execute(api, event, args) {
            const bet = args[0]?.toLowerCase(); if(!bet) return api.sendMessage("⚠️ Nhập tài hoặc xỉu!", event.threadID);
            const d = () => Math.floor(Math.random() * 6) + 1; const r1 = d(), r2 = d(), r3 = d(), t = r1+r2+r3, kq = t >= 11 ? "tài" : "xỉu";
            return api.sendMessage(`🎲 Kết quả: 🎲 ${r1} | ${r2} | ${r3} => ${t} điểm [${kq.toUpperCase()}]\n➔ ${bet === kq ? "🎉 Thắng!" : "💸 Thua!"}`, event.threadID);
        }
    },
    { name: "baucua", async execute(api, event) { const items = ["Bầu", "Cua", "Tôm", "Cá", "Gà", "Nai"]; return api.sendMessage(`🎋 Kết quả: [ ${items[Math.floor(Math.random()*6)]} | ${items[Math.floor(Math.random()*6)]} ]`, event.threadID); } },
    { name: "chanle", async execute(api, event, args) { const cl = args[0], r = Math.floor(Math.random()*10), kq = r % 2 === 0 ? "chẵn" : "lẻ"; return api.sendMessage(`🎲 Số ra: ${r} [${kq.toUpperCase()}]`, event.threadID); } },
    { name: "daovang", async execute(api, event) { return api.sendMessage(`⛏️ Bạn đào được túi vàng trị giá $${Math.floor(Math.random()*500)}!`, event.threadID); } }
];
