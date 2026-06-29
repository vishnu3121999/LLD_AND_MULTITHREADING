package B_Strategy.model;

import B_Strategy.model.enums.ExpiryType;
import B_Strategy.strategy.eviction.EvictionPolicy;

public class CacheConfig<K, V> {
    private final long defaultTtlMillis;
    private final ExpiryType expiryType;
    private final EvictionPolicy<K, V> evictionPolicy;

    public CacheConfig(long defaultTtlMillis, ExpiryType expiryType, EvictionPolicy<K, V> evictionPolicy) {
        this.defaultTtlMillis = defaultTtlMillis;
        this.expiryType = expiryType;
        this.evictionPolicy = evictionPolicy;
    }

    @Override
    public String toString() {
        return "CacheConfig{" +
                "defaultTtlMillis=" + defaultTtlMillis +
                ", expiryType=" + expiryType +
                ", evictionPolicy=" + evictionPolicy.getClass().getSimpleName() +
                '}';
    }

    public long getDefaultTtlMillis() { return defaultTtlMillis; }
    public ExpiryType getExpiryType() { return expiryType; }
    public EvictionPolicy<K, V> getEvictionPolicy() { return evictionPolicy; }
}
