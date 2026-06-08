package A_basic.model;

public class CacheEntry {
    private final String cacheEntryId;
    private final String key;
    private String value;
    public CacheEntry(String cacheEntryId, String key, String value) { this.cacheEntryId = cacheEntryId; this.key = key; this.value = value; }
    public void updateValue(String value) { this.value = value; }
    @Override public String toString() { return "CacheEntry{" + "cacheEntryId='" + cacheEntryId + "'" + ", key='" + key + "'" + ", value='" + value + "'" + '}'; }
    public String getCacheEntryId() { return cacheEntryId; }
    public String getKey() { return key; }
    public String getValue() { return value; }
}
