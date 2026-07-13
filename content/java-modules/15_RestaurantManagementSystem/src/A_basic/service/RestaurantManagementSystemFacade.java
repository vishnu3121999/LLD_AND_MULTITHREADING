package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.DiningTable;
import A_basic.model.MenuItem;
import A_basic.model.Order;
import A_basic.model.OrderItem;
import A_basic.model.Restaurant;

import java.util.ArrayList;
import java.util.List;

public class RestaurantManagementSystemFacade {
    private final DataStore dataStore;
    public RestaurantManagementSystemFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void reserveTable(String diningTableId) { dataStore.getDiningTable(diningTableId).reserve(); }

    public String placeOrder(String orderId, String diningTableId, List<String> menuItemList) {
        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;
        for (String menuItemId : menuItemList) {
            MenuItem menuItem = dataStore.getMenuItem(menuItemId);
            orderItems.add(new OrderItem(menuItemId, 1, menuItem.getPrice()));
            total += menuItem.getPrice();
        }
        Order order = new Order(orderId, diningTableId, orderItems, total);
        dataStore.putOrder(order.getOrderId(), order);
        return orderId;
    }

    public void serveOrder(String orderId) { dataStore.getOrder(orderId).serve(); }

    // System methods

    // Admin methods

    public void addRestaurant(String restaurantId, String name) { Restaurant restaurant = new Restaurant(restaurantId, name); dataStore.putRestaurant(restaurant.getRestaurantId(), restaurant); }
    public void addDiningTable(String restaurantId, String diningTableId, int capacity) { DiningTable table = new DiningTable(diningTableId, capacity); dataStore.putDiningTable(table.getDiningTableId(), table); dataStore.getRestaurant(restaurantId).addDiningTable(diningTableId); }
    public void addMenuItem(String restaurantId, String menuItemId, String name, double price) { MenuItem item = new MenuItem(menuItemId, name, price); dataStore.putMenuItem(item.getMenuItemId(), item); dataStore.getRestaurant(restaurantId).addMenuItem(menuItemId); }

    // Util/helper methods
}
