package B_Strategy.strategy.eviction;

import B_Strategy.model.CacheEntry;

import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

public class LFUEvictionPolicy<K, V> implements EvictionPolicy<K, V> {
    private FrequencyNode head;
    private final Map<String, FrequencyNode> entryFrequencyNodeMap;

    public LFUEvictionPolicy() {
        this.entryFrequencyNodeMap = new HashMap<>();
    }

    @Override
    public void onEntryAdded(CacheEntry<K, V> cacheEntry) {
        FrequencyNode frequencyNode = getOrCreateHeadFrequencyNode(0);
        frequencyNode.addEntry(cacheEntry.getCacheEntryId());
        entryFrequencyNodeMap.put(cacheEntry.getCacheEntryId(), frequencyNode);
    }

    @Override
    public void onEntryAccessed(CacheEntry<K, V> cacheEntry) {
        String cacheEntryId = cacheEntry.getCacheEntryId();
        FrequencyNode currentNode = entryFrequencyNodeMap.get(cacheEntryId);
        if (currentNode == null) {
            onEntryAdded(cacheEntry);
            return;
        }
        FrequencyNode nextNode = getOrCreateNextFrequencyNode(currentNode);

        currentNode.removeEntry(cacheEntryId);
        nextNode.addEntry(cacheEntryId);
        entryFrequencyNodeMap.put(cacheEntryId, nextNode);

        if (currentNode.isEmpty()) {
            removeFrequencyNode(currentNode);
        }
    }

    @Override
    public void onEntryUpdated(CacheEntry<K, V> cacheEntry) {
        FrequencyNode frequencyNode = entryFrequencyNodeMap.get(cacheEntry.getCacheEntryId());
        if (frequencyNode == null) {
            onEntryAdded(cacheEntry);
            return;
        }
        frequencyNode.moveToTail(cacheEntry.getCacheEntryId());
    }

    @Override
    public void onEntryRemoved(String cacheEntryId) {
        FrequencyNode frequencyNode = entryFrequencyNodeMap.remove(cacheEntryId);
        if (frequencyNode == null) {
            return;
        }
        frequencyNode.removeEntry(cacheEntryId);

        if (frequencyNode.isEmpty()) {
            removeFrequencyNode(frequencyNode);
        }
    }

    @Override
    public String evictEntryId() {
        if (head == null) {
            return null;
        }
        return head.firstEntryId();
    }

    private FrequencyNode getOrCreateHeadFrequencyNode(int frequency) {
        if (head != null && head.frequency == frequency) {
            return head;
        }

        FrequencyNode frequencyNode = new FrequencyNode(frequency);
        frequencyNode.next = head;
        if (head != null) {
            head.previous = frequencyNode;
        }
        head = frequencyNode;
        return frequencyNode;
    }

    private FrequencyNode getOrCreateNextFrequencyNode(FrequencyNode currentNode) {
        int nextFrequency = currentNode.frequency + 1;
        if (currentNode.next != null && currentNode.next.frequency == nextFrequency) {
            return currentNode.next;
        }

        FrequencyNode nextNode = new FrequencyNode(nextFrequency);
        nextNode.previous = currentNode;
        nextNode.next = currentNode.next;
        if (currentNode.next != null) {
            currentNode.next.previous = nextNode;
        }
        currentNode.next = nextNode;
        return nextNode;
    }

    private void removeFrequencyNode(FrequencyNode frequencyNode) {
        if (frequencyNode.previous != null) {
            frequencyNode.previous.next = frequencyNode.next;
        } else {
            head = frequencyNode.next;
        }

        if (frequencyNode.next != null) {
            frequencyNode.next.previous = frequencyNode.previous;
        }
    }

    private static class FrequencyNode {
        private final int frequency;
        private final Set<String> cacheEntryOrder;
        private FrequencyNode previous;
        private FrequencyNode next;

        private FrequencyNode(int frequency) {
            this.frequency = frequency;
            this.cacheEntryOrder = new LinkedHashSet<>();
        }

        private void addEntry(String cacheEntryId) {
            cacheEntryOrder.add(cacheEntryId);
        }

        private void removeEntry(String cacheEntryId) {
            cacheEntryOrder.remove(cacheEntryId);
        }

        private void moveToTail(String cacheEntryId) {
            cacheEntryOrder.remove(cacheEntryId);
            cacheEntryOrder.add(cacheEntryId);
        }

        private boolean isEmpty() {
            return cacheEntryOrder.isEmpty();
        }

        private String firstEntryId() {
            Iterator<String> iterator = cacheEntryOrder.iterator();
            return iterator.next();
        }
    }
}
