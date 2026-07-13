package A_basic.datastore;

        import A_basic.model.Store;
import A_basic.model.Product;
import A_basic.model.InventoryItem;
import A_basic.model.Customer;
import A_basic.model.Cart;
import A_basic.model.Order;

        public interface DataStore {

            Store getStore(String key);

            void putStore(String key, Store value);

            boolean containsStore(String key);

            Store removeStore(String key);
            Product getProduct(String key);

            void putProduct(String key, Product value);

            boolean containsProduct(String key);

            Product removeProduct(String key);
            InventoryItem getInventoryItem(String key);

            void putInventoryItem(String key, InventoryItem value);

            boolean containsInventoryItem(String key);

            InventoryItem removeInventoryItem(String key);
            Customer getCustomer(String key);

            void putCustomer(String key, Customer value);

            boolean containsCustomer(String key);

            Customer removeCustomer(String key);
            Cart getCart(String key);

            void putCart(String key, Cart value);

            boolean containsCart(String key);

            Cart removeCart(String key);
            Order getOrder(String key);

            void putOrder(String key, Order value);

            boolean containsOrder(String key);

            Order removeOrder(String key);
        }
