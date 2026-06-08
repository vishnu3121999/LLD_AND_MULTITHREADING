package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.SwiggyFacade;

import java.util.List;
import java.util.UUID;

public class Main { public static void main(String[] args) { System.out.println("=== Swiggy Basic Demo ==="); DataStore dataStore = new InMemoryDataStore(); SwiggyFacade facade = new SwiggyFacade(dataStore); String customerId = id("customer"); String restaurantId = id("restaurant"); String itemOne = id("item"); String itemTwo = id("item"); String partnerId = id("partner"); String orderId = id("order"); facade.addCustomer(customerId, "Asha"); facade.addRestaurant(restaurantId, "Pizza House"); facade.addMenuItem(restaurantId, itemOne, "Pizza", 299); facade.addMenuItem(restaurantId, itemTwo, "Garlic Bread", 129); facade.addDeliveryPartner(partnerId, "Rider One"); facade.placeOrder(orderId, customerId, restaurantId, List.of(itemOne, itemTwo)); System.out.println(dataStore.getOrder(orderId)); facade.completeOrder(orderId); System.out.println(dataStore.getOrder(orderId)); System.out.println(dataStore.getDeliveryPartner(partnerId)); } private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); } }
