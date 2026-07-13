package B_Strategy.datastore;

import B_Strategy.model.Product;
import B_Strategy.model.Rack;
import B_Strategy.model.VendingMachine;

import java.util.List;

public interface DataStore {
    VendingMachine getVendingMachine();

    Product getProduct(String key);

    void putProduct(String key, Product value);

    boolean containsProduct(String key);

    List<Product> getProductList();

    Rack getRack(String key);

    void putRack(String key, Rack value);

    boolean containsRack(String key);

    List<Rack> getRackList();
}
