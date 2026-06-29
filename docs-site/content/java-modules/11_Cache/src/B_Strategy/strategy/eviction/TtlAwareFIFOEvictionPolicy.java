package B_Strategy.strategy.eviction;

public class TtlAwareFIFOEvictionPolicy<K, V> extends TtlAwareEvictionPolicy<K, V> {
    public TtlAwareFIFOEvictionPolicy() {
        super(new FIFOEvictionPolicy<>());
    }
}
