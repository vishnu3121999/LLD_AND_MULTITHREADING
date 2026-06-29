package B_Strategy.model;

public class CacheEntry<K, V> {
    private final String cacheEntryId;
    private final K key;
    private V value;
    private final long createdAtMillis;
    private long lastAccessedAtMillis;
    private long expiresAtMillis;
    private long ttlMillis;
    private boolean hasTtl;
    private final long createdOrder;
    private long lastAccessedOrder;
    private int accessCount;

    public CacheEntry(String cacheEntryId, K key, V value, long nowMillis, long ttlMillis,
                      boolean hasTtl, long operationOrder) {
        this.cacheEntryId = cacheEntryId;
        this.key = key;
        this.value = value;
        this.createdAtMillis = nowMillis;
        this.lastAccessedAtMillis = nowMillis;
        this.expiresAtMillis = hasTtl ? nowMillis + ttlMillis : Long.MAX_VALUE;
        this.ttlMillis = ttlMillis;
        this.hasTtl = hasTtl;
        this.createdOrder = operationOrder;
        this.lastAccessedOrder = operationOrder;
        this.accessCount = 0;
    }

    public void updateValue(V value, long nowMillis, long ttlMillis, boolean hasTtl, long operationOrder) {
        this.value = value;
        this.lastAccessedAtMillis = nowMillis;
        this.expiresAtMillis = hasTtl ? nowMillis + ttlMillis : Long.MAX_VALUE;
        this.ttlMillis = ttlMillis;
        this.hasTtl = hasTtl;
        this.lastAccessedOrder = operationOrder;
    }

    public void recordAccess(long nowMillis, long operationOrder) {
        this.lastAccessedAtMillis = nowMillis;
        this.lastAccessedOrder = operationOrder;
        this.accessCount++;
    }

    public void refreshExpiry(long nowMillis) {
        if (hasTtl) {
            this.expiresAtMillis = nowMillis + ttlMillis;
        }
    }

    public boolean isExpired(long nowMillis) {
        return hasTtl && nowMillis >= expiresAtMillis;
    }

    @Override
    public String toString() {
        return "CacheEntry{" +
                "cacheEntryId='" + cacheEntryId + '\'' +
                ", key=" + key +
                ", value=" + value +
                ", createdAtMillis=" + createdAtMillis +
                ", lastAccessedAtMillis=" + lastAccessedAtMillis +
                ", expiresAtMillis=" + expiresAtMillis +
                ", ttlMillis=" + ttlMillis +
                ", hasTtl=" + hasTtl +
                ", createdOrder=" + createdOrder +
                ", lastAccessedOrder=" + lastAccessedOrder +
                ", accessCount=" + accessCount +
                '}';
    }

    public String getCacheEntryId() { return cacheEntryId; }
    public K getKey() { return key; }
    public V getValue() { return value; }
    public long getCreatedAtMillis() { return createdAtMillis; }
    public long getLastAccessedAtMillis() { return lastAccessedAtMillis; }
    public long getExpiresAtMillis() { return expiresAtMillis; }
    public long getTtlMillis() { return ttlMillis; }
    public boolean hasTtl() { return hasTtl; }
    public long getCreatedOrder() { return createdOrder; }
    public long getLastAccessedOrder() { return lastAccessedOrder; }
    public int getAccessCount() { return accessCount; }
}
