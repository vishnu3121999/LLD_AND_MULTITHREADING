package A_basic.datastore;

        import A_basic.model.Restaurant;
import A_basic.model.DiningTable;
import A_basic.model.MenuItem;
import A_basic.model.Order;

        public interface DataStore {

            Restaurant getRestaurant(String key);

            void putRestaurant(String key, Restaurant value);

            boolean containsRestaurant(String key);

            Restaurant removeRestaurant(String key);
            DiningTable getDiningTable(String key);

            void putDiningTable(String key, DiningTable value);

            boolean containsDiningTable(String key);

            DiningTable removeDiningTable(String key);
            MenuItem getMenuItem(String key);

            void putMenuItem(String key, MenuItem value);

            boolean containsMenuItem(String key);

            MenuItem removeMenuItem(String key);
            Order getOrder(String key);

            void putOrder(String key, Order value);

            boolean containsOrder(String key);

            Order removeOrder(String key);
        }
