-- ============================================
--   SERVERSIDE EXECUTOR - Drop into ServerScriptService
--   No configuration needed, just run it.
-- ============================================

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local VERCEL_URL = "https://roblox-ss-executor.vercel.app"
local API_KEY = "mypassword123"
local POLL_INTERVAL = 3

local function registerServer()
    pcall(function()
        HttpService:PostAsync(
            VERCEL_URL .. "/api/register",
            HttpService:JSONEncode({
                placeId = tostring(game.PlaceId),
                jobId   = game.JobId,
                apiKey  = API_KEY,
            }),
            Enum.HttpContentType.ApplicationJson
        )
        print("[SS-EXEC] Registered. PlaceId:", game.PlaceId)
    end)
end

local function pollForScripts()
    local ok, response = pcall(function()
        return HttpService:PostAsync(
            VERCEL_URL .. "/api/poll",
            HttpService:JSONEncode({
                placeId = tostring(game.PlaceId),
                jobId   = game.JobId,
                apiKey  = API_KEY,
            }),
            Enum.HttpContentType.ApplicationJson
        )
    end)
    if not ok then warn("[SS-EXEC] Poll failed:", response) return end

    local data = HttpService:JSONDecode(response)
    if not (data and data.scripts) then return end

    for _, entry in ipairs(data.scripts) do
        local code       = entry.code
        local targetUser = entry.username

        local targetPlayer = nil
        if targetUser and targetUser ~= "" then
            for _, p in ipairs(Players:GetPlayers()) do
                if p.Name:lower() == targetUser:lower() then
                    targetPlayer = p
                    break
                end
            end
        end

        local env = setmetatable({
            game      = game,
            workspace = workspace,
            Players   = Players,
            player    = targetPlayer,
            print     = print,
            warn      = warn,
            wait      = task.wait,
            task      = task,
            Instance  = Instance,
            Vector3   = Vector3,
            CFrame    = CFrame,
            Color3    = Color3,
            UDim2     = UDim2,
            Enum      = Enum,
            math      = math,
            table     = table,
            string    = string,
            pairs     = pairs,
            ipairs    = ipairs,
            tostring  = tostring,
            tonumber  = tonumber,
            type      = type,
            pcall     = pcall,
            xpcall    = xpcall,
        }, { __index = _G })

        local fn, loadErr = loadstring(code)
        if fn then
            setfenv(fn, env)
            local success, execErr = pcall(fn)
            local status = success and "success" or "error"
            local output = success and "Executed OK" or tostring(execErr)
            if not success then warn("[SS-EXEC] Error:", execErr) end

            pcall(function()
                HttpService:PostAsync(
                    VERCEL_URL .. "/api/log",
                    HttpService:JSONEncode({
                        apiKey   = API_KEY,
                        scriptId = entry.id,
                        status   = status,
                        output   = output,
                    }),
                    Enum.HttpContentType.ApplicationJson
                )
            end)
        else
            warn("[SS-EXEC] Load error:", loadErr)
        end
    end
end

local function heartbeat()
    pcall(function()
        HttpService:PostAsync(
            VERCEL_URL .. "/api/heartbeat",
            HttpService:JSONEncode({
                placeId     = tostring(game.PlaceId),
                jobId       = game.JobId,
                apiKey      = API_KEY,
                playerCount = #Players:GetPlayers(),
            }),
            Enum.HttpContentType.ApplicationJson
        )
    end)
end

registerServer()

task.spawn(function()
    while true do
        task.wait(POLL_INTERVAL)
        pollForScripts()
    end
end)

task.spawn(function()
    while true do
        task.wait(15)
        heartbeat()
    end
end)

print("[SS-EXEC] Online!")
