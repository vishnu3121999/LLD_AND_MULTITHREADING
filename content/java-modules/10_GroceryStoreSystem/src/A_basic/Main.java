package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.GroceryStoreSystemFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Grocery Store Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        GroceryStoreSystemFacade facade = new GroceryStoreSystemFacade(dataStore);
        String storeId = id("store");
        String customerId = id("customer");
        String productId = id("product");
        String itemId = id("inventory");
        String cartId = id("cart");
        String orderId = id("order");
        facade.addStore(storeId, "Fresh Mart");
        facade.addCustomer(customerId, "Asha");
        facade.addProduct(productId, "Milk", "DailyFarm");
        facade.addInventoryItem(storeId, itemId, productId, 20, 42.0);
        facade.createCart(cartId, customerId);
        facade.addItemToCart(cartId, itemId, 2);
        facade.checkout(orderId, cartId);
        System.out.println(dataStore.getOrder(orderId));
        System.out.println(dataStore.getInventoryItem(itemId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
