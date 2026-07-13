package B_Strategy.datastore;

import B_Strategy.model.Product;
import B_Strategy.model.Rack;
import B_Strategy.model.VendingMachine;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class InMemoryDataStore implements DataStore {
    private final VendingMachine vendingMachine;
    private final Map<String, Product> productMap;
    private final Map<String, Rack> rackMap;

    public InMemoryDataStore(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
        this.productMap = new HashMap<>();
        this.rackMap = new HashMap<>();
    }

    @Override
    public VendingMachine getVendingMachine() {
        return vendingMachine;
    }

    @Override
    public Product getProduct(String key) {
        return productMap.get(key);
    }

    @Override
    public void putProduct(String key, Product value) {
        productMap.put(key, value);
    }

    @Override
    public boolean containsProduct(String key) {
        return productMap.containsKey(key);
    }

    @Override
    public List<Product> getProductList() {
        return new ArrayList<>(productMap.values());
    }

    @Override
    public Rack getRack(String key) {
        return rackMap.get(key);
    }

    @Override
    public void putRack(String key, Rack value) {
        rackMap.put(key, value);
    }

    @Override
    public boolean containsRack(String key) {
        return rackMap.containsKey(key);
    }

    @Override
    public List<Rack> getRackList() {
        return new ArrayList<>(rackMap.values());
    }
}
