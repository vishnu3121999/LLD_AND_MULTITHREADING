package D_ExceptionHandlingV2.datastore;

import D_ExceptionHandlingV2.model.Product;
import D_ExceptionHandlingV2.model.Rack;
import D_ExceptionHandlingV2.model.VendingMachine;

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
