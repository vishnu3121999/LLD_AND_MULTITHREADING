package A_basic.model;

public class OrderItem {
    private final String menuItemId;
    private final int quantity;
    private final double price;
    public OrderItem(String menuItemId, int quantity, double price) { this.menuItemId = menuItemId; this.quantity = quantity; this.price = price; }
    @Override public String toString() { return "OrderItem{" + "menuItemId='" + menuItemId + "'" + ", quantity=" + quantity + ", price=" + price + '}'; }
    public String getMenuItemId() { return menuItemId; }
    public int getQuantity() { return quantity; }
    public double getPrice() { return price; }
}
