package A_basic.model;

import A_basic.model.enums.EvictionType;
import A_basic.model.enums.ExpiryType;

public class CacheConfig {
    private final long defaultTtlMillis;
    private final EvictionType evictionType;
    private final ExpiryType expiryType;

    public CacheConfig(long defaultTtlMillis, EvictionType evictionType, ExpiryType expiryType) {
        this.defaultTtlMillis = defaultTtlMillis;
        this.evictionType = evictionType;
        this.expiryType = expiryType;
    }

    @Override
    public String toString() {
        return "CacheConfig{" +
                "defaultTtlMillis=" + defaultTtlMillis +
                ", evictionType=" + evictionType +
                ", expiryType=" + expiryType +
                '}';
    }

    public long getDefaultTtlMillis() { return defaultTtlMillis; }
    public EvictionType getEvictionType() { return evictionType; }
    public ExpiryType getExpiryType() { return expiryType; }
}
