package B_Strategy.strategy.eviction;

public class TtlAwareLRUEvictionPolicy<K, V> extends TtlAwareEvictionPolicy<K, V> {
    public TtlAwareLRUEvictionPolicy() {
        super(new LRUEvictionPolicy<>());
    }
}
