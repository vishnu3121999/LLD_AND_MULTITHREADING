package A_basic.datastore;

        import A_basic.model.Customer;
import A_basic.model.Restaurant;
import A_basic.model.MenuItem;
import A_basic.model.DeliveryPartner;
import A_basic.model.Order;

        import java.util.HashMap;
        import java.util.Map;
import java.util.ArrayList;
import java.util.List;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, Customer> customerMap;
    private final Map<String, Restaurant> restaurantMap;
    private final Map<String, MenuItem> menuItemMap;
    private final Map<String, DeliveryPartner> deliveryPartnerMap;
    private final Map<String, Order> orderMap;

            public InMemoryDataStore() {
                this.customerMap = new HashMap<>();
        this.restaurantMap = new HashMap<>();
        this.menuItemMap = new HashMap<>();
        this.deliveryPartnerMap = new HashMap<>();
        this.orderMap = new HashMap<>();
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
            public DeliveryPartner getDeliveryPartner(String key) {
                return deliveryPartnerMap.get(key);
            }

            @Override
            public void putDeliveryPartner(String key, DeliveryPartner value) {
                deliveryPartnerMap.put(key, value);
            }

            @Override
            public boolean containsDeliveryPartner(String key) {
                return deliveryPartnerMap.containsKey(key);
            }

            @Override
            public DeliveryPartner removeDeliveryPartner(String key) {
                return deliveryPartnerMap.remove(key);
            }

            @Override
            public List<DeliveryPartner> getDeliveryPartnerList() {
                return new ArrayList<>(deliveryPartnerMap.values());
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
