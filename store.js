global._servers = global._servers || {};
global._queue   = global._queue   || {};
global._logs    = global._logs    || [];

module.exports = {
    servers: global._servers,
    queue:   global._queue,
    logs:    global._logs,
};
