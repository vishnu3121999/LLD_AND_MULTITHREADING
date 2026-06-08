package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Customer;
import A_basic.model.DeliveryPartner;
import A_basic.model.MenuItem;
import A_basic.model.Order;
import A_basic.model.Restaurant;
import A_basic.model.enums.PartnerStatus;

import java.util.List;

public class SwiggyFacade {
    private final DataStore dataStore;
    public SwiggyFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String placeOrder(String orderId, String customerId, String restaurantId, List<String> menuItemList) {
        double total = calculateTotal(menuItemList);
        Order order = new Order(orderId, customerId, restaurantId, menuItemList, total);
        DeliveryPartner partner = assignDeliveryPartner();
        partner.assign();
        order.assignPartner(partner.getDeliveryPartnerId());
        dataStore.putOrder(order.getOrderId(), order);
        return orderId;
    }

    public void completeOrder(String orderId) { Order order = dataStore.getOrder(orderId); order.deliver(); dataStore.getDeliveryPartner(order.getDeliveryPartnerId()).markAvailable(); }

    // System methods

    public DeliveryPartner assignDeliveryPartner() { for (DeliveryPartner partner : dataStore.getDeliveryPartnerList()) if (partner.getPartnerStatus() == PartnerStatus.AVAILABLE) return partner; return null; }

    // Admin methods

    public void addCustomer(String customerId, String name) { Customer customer = new Customer(customerId, name); dataStore.putCustomer(customer.getCustomerId(), customer); }
    public void addRestaurant(String restaurantId, String name) { Restaurant restaurant = new Restaurant(restaurantId, name); dataStore.putRestaurant(restaurant.getRestaurantId(), restaurant); }
    public void addMenuItem(String restaurantId, String menuItemId, String name, double price) { MenuItem item = new MenuItem(menuItemId, name, price); dataStore.putMenuItem(item.getMenuItemId(), item); dataStore.getRestaurant(restaurantId).addMenuItem(menuItemId); }
    public void addDeliveryPartner(String deliveryPartnerId, String name) { DeliveryPartner partner = new DeliveryPartner(deliveryPartnerId, name); dataStore.putDeliveryPartner(partner.getDeliveryPartnerId(), partner); }

    // Util/helper methods

    private double calculateTotal(List<String> menuItemList) { double total = 0; for (String menuItemId : menuItemList) total += dataStore.getMenuItem(menuItemId).getPrice(); return total; }
}
