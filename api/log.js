const { logs, queue } = require("./store");
const API_KEY = "mypassword123";

module.exports = (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method !== "POST") return res.status(405).end();
    const { apiKey, scriptId, status, output } = req.body;
    if (apiKey !== API_KEY) return res.status(403).json({ error: "Unauthorized" });
    for (const jobId in queue) {
        const script = queue[jobId].find(s => s.id === scriptId);
        if (script) { script.status = status; script.output = output; }
    }
    logs.unshift({ scriptId, status, output, time: Date.now() });
    if (logs.length > 100) logs.pop();
    return res.json({ ok: true });
};
