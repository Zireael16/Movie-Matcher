-- KEYS: List of seat lock keys (e.g., lock:showtime:1:seat:A1, lock:showtime:1:seat:A2)
-- ARGV[1]: Expected lock payload value (<holdToken>:<userId>)

local releasedCount = 0

for i = 1, #KEYS do
    local currentValue = redis.call('GET', KEYS[i])
    if currentValue == ARGV[1] then
        redis.call('DEL', KEYS[i])
        releasedCount = releasedCount + 1
    end
end

return releasedCount