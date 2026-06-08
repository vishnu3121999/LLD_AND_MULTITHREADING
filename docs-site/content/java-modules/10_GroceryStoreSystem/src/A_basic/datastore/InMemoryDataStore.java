package A_basic.datastore;

        import A_basic.model.Store;
import A_basic.model.Product;
import A_basic.model.InventoryItem;
import A_basic.model.Customer;
import A_basic.model.Cart;
import A_basic.model.Order;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Store> storeMap;
    private final Map<String, Product> productMap;
    private final Map<String, InventoryItem> inventoryItemMap;
    private final Map<String, Customer> customerMap;
    private final Map<String, Cart> cartMap;
    private final Map<String, Order> orderMap;

            public InMemoryDataStore() {
                this.storeMap = new HashMap<>();
        this.productMap = new HashMap<>();
        this.inventoryItemMap = new HashMap<>();
        this.customerMap = new HashMap<>();
        this.cartMap = new HashMap<>();
        this.orderMap = new HashMap<>();
            }


            @Override
            public Store getStore(String key) {
                return storeMap.get(key);
            }

            @Override
            public void putStore(String key, Store value) {
                storeMap.put(key, value);
            }

            @Override
            public boolean containsStore(String key) {
                return storeMap.containsKey(key);
            }

            @Override
            public Store removeStore(String key) {
                return storeMap.remove(key);
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
            public Product removeProduct(String key) {
                return productMap.remove(key);
            }
            @Override
            public InventoryItem getInventoryItem(String key) {
                return inventoryItemMap.get(key);
            }

            @Override
            public void putInventoryItem(String key, InventoryItem value) {
                inventoryItemMap.put(key, value);
            }

            @Override
            public boolean containsInventoryItem(String key) {
                return inventoryItemMap.containsKey(key);
            }

            @Override
            public InventoryItem removeInventoryItem(String key) {
                return inventoryItemMap.remove(key);
            }
            @Override
            public Customer getCustomer(String key) {
                return customerMap.get(key);
            }

            @Override
            public void putCustomer(String key, Customer value) {
                customerMap.put(key, value);
            }

            @Override
            public boolean containsCustomer(String key) {
                return customerMap.containsKey(key);
            }

            @Override
            public Customer removeCustomer(String key) {
                return customerMap.remove(key);
            }
            @Override
            public Cart getCart(String key) {
                return cartMap.get(key);
            }

            @Override
            public void putCart(String key, Cart value) {
                cartMap.put(key, value);
            }

            @Override
            public boolean containsCart(String key) {
                return cartMap.containsKey(key);
            }

            @Override
            public Cart removeCart(String key) {
                return cartMap.remove(key);
            }
            @Override
            public Order getOrder(String key) {
                return orderMap.get(key);
            }

            @Override
            public void putOrder(String key, Order value) {
                orderMap.put(key, value);
            }

            @Override
            public boolean containsOrder(String key) {
                return orderMap.containsKey(key);
            }

            @Override
            public Order removeOrder(String key) {
                return orderMap.remove(key);
            }
        }
