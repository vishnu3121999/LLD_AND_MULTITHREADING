package B_Strategy.dispatcher;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Product;
import B_Strategy.model.Rack;
import B_Strategy.model.VendingMachine;
import B_Strategy.model.enums.Coin;

import java.util.Map;

public class DispatcherService {
    private final DataStore dataStore;

    public DispatcherService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Product dispatchProduct(String rackId) {
        Rack rack = dataStore.getRack(rackId);
        rack.reduceProductCount();
        return dataStore.getProduct(rack.getProductId());
    }

    public void dispatchChange(Map<Coin, Integer> changeMap) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        for (Map.Entry<Coin, Integer> entry : changeMap.entrySet()) {
            vendingMachine.reduceCoin(entry.getKey(), entry.getValue());
        }
    }
}
