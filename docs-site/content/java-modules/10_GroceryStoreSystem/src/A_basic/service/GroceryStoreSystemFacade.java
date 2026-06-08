package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Cart;
import A_basic.model.CartItem;
import A_basic.model.Customer;
import A_basic.model.InventoryItem;
import A_basic.model.Order;
import A_basic.model.Product;
import A_basic.model.Store;

public class GroceryStoreSystemFacade {
    private final DataStore dataStore;
    public GroceryStoreSystemFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void createCart(String cartId, String customerId) {
        Cart cart = new Cart(cartId, customerId);
        dataStore.putCart(cart.getCartId(), cart);
    }

    public void addItemToCart(String cartId, String inventoryItemId, int quantity) {
        InventoryItem inventoryItem = dataStore.getInventoryItem(inventoryItemId);
        dataStore.getCart(cartId).addCartItem(new CartItem(inventoryItemId, quantity, inventoryItem.getPrice()));
    }

    public String checkout(String orderId, String cartId) {
        Cart cart = dataStore.getCart(cartId);
        double total = calculateTotal(cart);
        for (CartItem cartItem : cart.getCartItemList()) dataStore.getInventoryItem(cartItem.getInventoryItemId()).reduceQuantity(cartItem.getQuantity());
        Order order = new Order(orderId, cart.getCustomerId(), cart.getCartItemList(), total);
        order.pay();
        dataStore.putOrder(order.getOrderId(), order);
        cart.clear();
        return orderId;
    }

    // System methods

    public double calculateTotal(Cart cart) {
        double total = 0;
        for (CartItem cartItem : cart.getCartItemList()) total += cartItem.getPrice() * cartItem.getQuantity();
        return total;
    }

    // Admin methods

    public void addStore(String storeId, String name) { Store store = new Store(storeId, name); dataStore.putStore(store.getStoreId(), store); }
    public void addCustomer(String customerId, String name) { Customer customer = new Customer(customerId, name); dataStore.putCustomer(customer.getCustomerId(), customer); }
    public void addProduct(String productId, String name, String brand) { Product product = new Product(productId, name, brand); dataStore.putProduct(product.getProductId(), product); }
    public void addInventoryItem(String storeId, String inventoryItemId, String productId, int quantity, double price) { InventoryItem item = new InventoryItem(inventoryItemId, productId, quantity, price); dataStore.putInventoryItem(item.getInventoryItemId(), item); dataStore.getStore(storeId).addInventoryItem(inventoryItemId); }

    // Util/helper methods
}
