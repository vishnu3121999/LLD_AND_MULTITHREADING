package D_ExceptionHandling.dispatcher;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.Product;
import D_ExceptionHandling.model.Rack;
import D_ExceptionHandling.model.VendingMachine;
import D_ExceptionHandling.model.enums.Coin;

import java.util.Map;
import java.util.NoSuchElementException;

public class DispatcherService {
    private final DataStore dataStore;

    public DispatcherService(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public Product dispatchProduct(String rackId) {
        Rack rack = getRequiredRack(rackId);
        Product product = getRequiredProduct(rack.getProductId());
        validateRackHasProduct(rack);
        validateRackHasStock(rack);
        rack.reduceProductCount();
        return product;
    }

    public void dispatchChange(Map<Coin, Integer> changeMap) {
        if (changeMap == null) {
            throw new IllegalArgumentException("changeMap is required");
        }
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        for (Map.Entry<Coin, Integer> entry : changeMap.entrySet()) {
            vendingMachine.reduceCoin(entry.getKey(), entry.getValue());
        }
    }

    private Product getRequiredProduct(String productId) {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("productId is required");
        }
        Product product = dataStore.getProduct(productId);
        if (product == null) {
            throw new NoSuchElementException("Product not found: " + productId);
        }
        return product;
    }

    private Rack getRequiredRack(String rackId) {
        if (rackId == null || rackId.isBlank()) {
            throw new IllegalArgumentException("rackId is required");
        }
        Rack rack = dataStore.getRack(rackId);
        if (rack == null) {
            throw new NoSuchElementException("Rack not found: " + rackId);
        }
        return rack;
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
