package B_Strategy.strategy.eviction;

public class TtlAwareLFUEvictionPolicy<K, V> extends TtlAwareEvictionPolicy<K, V> {
    public TtlAwareLFUEvictionPolicy() {
        super(new LFUEvictionPolicy<>());
    }
}
