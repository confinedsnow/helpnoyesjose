const { servers, queue } = require("./store");
const API_KEY = "mypassword123";

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "POST") return res.status(405).end();
    const { placeId, jobId, apiKey } = req.body;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    servers[jobId] = { placeId, jobId, lastSeen: Date.now(), playerCount: 0 };
    if (!queue[jobId]) queue[jobId] = [];
    return res.json({ ok: true });
};
