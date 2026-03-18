const { servers } = require("./store");
const API_KEY = "mypassword123";

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "GET") return res.status(405).end();
    const { apiKey } = req.query;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    const now = Date.now();
    const active = Object.values(servers).filter(s => now - s.lastSeen < 30000);
    return res.json({ servers: active });
};
