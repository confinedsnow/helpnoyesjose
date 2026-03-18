const { queue } = require("./store");
const API_KEY = "mypassword123";

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "POST") return res.status(405).end();
    const { jobId, apiKey } = req.body;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    const pending = (queue[jobId] || []).filter(s => s.status === "pending");
    pending.forEach(s => s.status = "sent");
    return res.json({ scripts: pending });
};
