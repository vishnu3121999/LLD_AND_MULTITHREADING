package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.RestaurantManagementSystemFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Restaurant Management Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        RestaurantManagementSystemFacade facade = new RestaurantManagementSystemFacade(dataStore);
        String restaurantId = id("restaurant");
        String tableId = id("table");
        String dosaId = id("menu");
        String coffeeId = id("menu");
        String orderId = id("order");
        facade.addRestaurant(restaurantId, "South Cafe");
        facade.addDiningTable(restaurantId, tableId, 4);
        facade.addMenuItem(restaurantId, dosaId, "Dosa", 90.0);
        facade.addMenuItem(restaurantId, coffeeId, "Filter Coffee", 35.0);
        facade.reserveTable(tableId);
        facade.placeOrder(orderId, tableId, List.of(dosaId, coffeeId));
        facade.serveOrder(orderId);
        System.out.println(dataStore.getDiningTable(tableId));
        System.out.println(dataStore.getOrder(orderId));
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
