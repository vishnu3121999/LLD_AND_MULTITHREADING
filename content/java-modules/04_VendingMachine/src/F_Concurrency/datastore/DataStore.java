package F_Concurrency.datastore;

import F_Concurrency.model.Product;
import F_Concurrency.model.Rack;
import F_Concurrency.model.VendingMachine;

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
