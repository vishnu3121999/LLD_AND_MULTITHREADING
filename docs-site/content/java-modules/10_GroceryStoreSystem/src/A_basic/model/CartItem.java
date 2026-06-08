package A_basic.model;

public class CartItem {
    private final String inventoryItemId;
    private final int quantity;
    private final double price;
    public CartItem(String inventoryItemId, int quantity, double price) { this.inventoryItemId = inventoryItemId; this.quantity = quantity; this.price = price; }
    @Override public String toString() { return "CartItem{" + "inventoryItemId='" + inventoryItemId + "'" + ", quantity=" + quantity + ", price=" + price + '}'; }
    public String getInventoryItemId() { return inventoryItemId; }
    public int getQuantity() { return quantity; }
    public double getPrice() { return price; }
}
