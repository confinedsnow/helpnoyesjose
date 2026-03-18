const { servers } = require("./store");
const API_KEY = "mypassword123";

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "POST") return res.status(405).end();
    const { jobId, apiKey, playerCount, placeId } = req.body;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    if (servers[jobId]) {
        servers[jobId].lastSeen = Date.now();
        servers[jobId].playerCount = playerCount || 0;
    } else {
        servers[jobId] = { placeId, jobId, lastSeen: Date.now(), playerCount: playerCount || 0 };
    }
    return res.json({ ok: true });
};
