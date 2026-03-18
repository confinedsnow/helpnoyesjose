const { queue } = require("./store");
const API_KEY = "mypassword123";
const crypto = require("crypto");

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).end();
    const { apiKey, jobId, code, username } = req.body;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    if (!queue[jobId]) return res.status(404).json({ error: "Server not found" });
    const script = {
        id: crypto.randomUUID(),
        code,
        username: username || "",
        status: "pending",
        output: null,
        time: Date.now(),
    };
    queue[jobId].push(script);
    if (queue[jobId].length > 50) queue[jobId].shift();
    return res.json({ ok: true, scriptId: script.id });
};
