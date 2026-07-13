package A_basic.dispatcher;

import A_basic.datastore.DataStore;
import A_basic.model.Product;
import A_basic.model.Rack;
import A_basic.model.VendingMachine;
import A_basic.model.enums.Coin;

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
