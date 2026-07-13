package C_Factory.dispatcher;

import C_Factory.datastore.DataStore;
import C_Factory.model.Product;
import C_Factory.model.Rack;
import C_Factory.model.VendingMachine;
import C_Factory.model.enums.Coin;

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
