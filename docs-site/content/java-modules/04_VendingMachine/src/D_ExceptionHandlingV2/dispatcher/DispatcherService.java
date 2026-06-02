package D_ExceptionHandlingV2.dispatcher;

import D_ExceptionHandlingV2.datastore.DataStore;
import D_ExceptionHandlingV2.model.Product;
import D_ExceptionHandlingV2.model.Rack;
import D_ExceptionHandlingV2.model.VendingMachine;
import D_ExceptionHandlingV2.model.enums.Coin;

import java.util.Map;

public class DispatcherService {
    private final DataStore dataStore;

    public DispatcherService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Product dispatchProduct(String rackId) {
        Rack rack = dataStore.getRack(rackId);
        Product product = dataStore.getProduct(rack.getProductId());
        validateRackHasProduct(rack);
        validateRackHasStock(rack);
        rack.reduceProductCount();
        return product;
    }

    public void dispatchChange(Map<Coin, Integer> changeMap) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        for (Map.Entry<Coin, Integer> entry : changeMap.entrySet()) {
            vendingMachine.reduceCoin(entry.getKey(), entry.getValue());
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
