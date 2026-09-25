-- KEYS: List of seat lock keys (e.g., lock:showtime:1:seat:A1, lock:showtime:1:seat:A2)
-- ARGV[1]: Lock payload value (<holdToken>:<userId>)
-- ARGV[2]: TTL in seconds (e.g., 600)

-- Step 1: Check if any requested seat key is already locked or exists
for i = 1, #KEYS do
    if redis.call('EXISTS', KEYS[i]) == 1 then
        return 0
    end
end

-- Step 2: All seats are free; acquire all locks with the specified TTL
for i = 1, #KEYS do
    redis.call('SET', KEYS[i], ARGV[1], 'EX', tonumber(ARGV[2]))
end

return 1