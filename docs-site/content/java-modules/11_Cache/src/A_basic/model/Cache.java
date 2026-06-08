package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Cache {
    private final String cacheId;
    private final int capacity;
    private final List<String> cacheEntryList;
    public Cache(String cacheId, int capacity) { this.cacheId = cacheId; this.capacity = capacity; this.cacheEntryList = new ArrayList<>(); }
    public void addCacheEntry(String cacheEntryId) { cacheEntryList.add(cacheEntryId); }
    @Override public String toString() { return "Cache{" + "cacheId='" + cacheId + "'" + ", capacity=" + capacity + ", cacheEntryList=" + cacheEntryList + '}'; }
    public String getCacheId() { return cacheId; }
    public int getCapacity() { return capacity; }
    public List<String> getCacheEntryList() { return Collections.unmodifiableList(cacheEntryList); }
}
