package F_Concurrency.dispatcher;

import F_Concurrency.datastore.DataStore;
import F_Concurrency.model.Product;
import F_Concurrency.model.Rack;
import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.Coin;

import java.util.Map;

public class DispatcherService {
    private final DataStore dataStore;

    public DispatcherService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Product dispatchProduct(String rackId) {
        Rack rack = dataStore.getRack(rackId);
        synchronized (rack) {
            validateRackHasProduct(rack);
            validateRackHasStock(rack);
            Product product = dataStore.getProduct(rack.getProductId());
            rack.reduceProductCount();
            return product;
        }
    }

    public void dispatchChange(Map<Coin, Integer> changeMap) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        synchronized (vendingMachine) {
            for (Map.Entry<Coin, Integer> entry : changeMap.entrySet()) {
                vendingMachine.reduceCoin(entry.getKey(), entry.getValue());
            }
        }
    }

    private void validateRackHasProduct(Rack rack) {
        if (rack.getProductId() == null) {
            throw new RuntimeException("Rack has no product assigned: " + rack.getRackId());
        }
    }

    private void validateRackHasStock(Rack rack) {
        if (rack.getProductCount() <= 0) {
            throw new RuntimeException("Rack is out of stock: " + rack.getRackId());
        }
    }
}
