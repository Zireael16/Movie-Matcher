package com.app.moviematcher.booking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration class for distributed seat locking and caching.
 * Configures UTF-8 string serialization for transparent key-value operations
 * and registers compiled Lua scripts for atomic multi-key locking and releasing.
 */
@Configuration
public class RedisConfig {

    /**
     * Configures the primary StringRedisTemplate with standard StringRedisSerializer
     * for keys, values, hash keys, and hash values to avoid default Java binary serialization.
     *
     * @param connectionFactory the active Redis connection factory managed by Spring Boot
     * @return fully configured StringRedisTemplate instance
     */
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(connectionFactory);

        // Use pure UTF-8 string serialization for both keys and values
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setValueSerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setHashValueSerializer(stringSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Pre-loads the atomic seat lock acquisition Lua script.
     * Checks all target keys atomically; if any seat is already locked, returns 0.
     * If all are available, sets all keys with the specified TTL and returns 1.
     *
     * @return pre-compiled RedisScript bean returning Long (0 = failure, 1 = success)
     */
    @Bean
    public RedisScript<Long> acquireSeatLockScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setLocation(new ClassPathResource("scripts/acquire_seat_lock.lua"));
        script.setResultType(Long.class);
        return script;
    }

    /**
     * Pre-loads the safe seat lock release Lua script.
     * Validates that each lock key holds the expected holdToken:userId payload
     * before deleting it, preventing accidental unlocks of expired keys.
     *
     * @return pre-compiled RedisScript bean returning Long (count of released keys)
     */
    @Bean
    public RedisScript<Long> releaseSeatLockScript() {
        DefaultRedisScript<Long> script = new DefaultRedisScript<>();
        script.setLocation(new ClassPathResource("scripts/release_seat_lock.lua"));
        script.setResultType(Long.class);
        return script;
    }
}