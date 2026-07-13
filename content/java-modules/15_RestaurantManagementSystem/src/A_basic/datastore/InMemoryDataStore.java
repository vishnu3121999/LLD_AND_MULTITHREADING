package A_basic.datastore;

        import A_basic.model.Restaurant;
import A_basic.model.DiningTable;
import A_basic.model.MenuItem;
import A_basic.model.Order;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Restaurant> restaurantMap;
    private final Map<String, DiningTable> diningTableMap;
    private final Map<String, MenuItem> menuItemMap;
    private final Map<String, Order> orderMap;

            public InMemoryDataStore() {
                this.restaurantMap = new HashMap<>();
        this.diningTableMap = new HashMap<>();
        this.menuItemMap = new HashMap<>();
        this.orderMap = new HashMap<>();
            }


            @Override
            public Restaurant getRestaurant(String key) {
                return restaurantMap.get(key);
            }

            @Override
            public void putRestaurant(String key, Restaurant value) {
                restaurantMap.put(key, value);
            }

            @Override
            public boolean containsRestaurant(String key) {
                return restaurantMap.containsKey(key);
            }

            @Override
            public Restaurant removeRestaurant(String key) {
                return restaurantMap.remove(key);
            }
            @Override
            public DiningTable getDiningTable(String key) {
                return diningTableMap.get(key);
            }

            @Override
            public void putDiningTable(String key, DiningTable value) {
                diningTableMap.put(key, value);
            }

            @Override
            public boolean containsDiningTable(String key) {
                return diningTableMap.containsKey(key);
            }

            @Override
            public DiningTable removeDiningTable(String key) {
                return diningTableMap.remove(key);
            }
            @Override
            public MenuItem getMenuItem(String key) {
                return menuItemMap.get(key);
            }

            @Override
            public void putMenuItem(String key, MenuItem value) {
                menuItemMap.put(key, value);
            }

            @Override
            public boolean containsMenuItem(String key) {
                return menuItemMap.containsKey(key);
            }

            @Override
            public MenuItem removeMenuItem(String key) {
                return menuItemMap.remove(key);
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
