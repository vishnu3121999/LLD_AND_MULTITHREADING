package A_basic.model;

public class InventoryItem {
    private final String inventoryItemId;
    private final String productId;
    private int quantity;
    private final double price;
    public InventoryItem(String inventoryItemId, String productId, int quantity, double price) { this.inventoryItemId = inventoryItemId; this.productId = productId; this.quantity = quantity; this.price = price; }
    public void reduceQuantity(int count) { quantity -= count; }
    @Override public String toString() { return "InventoryItem{" + "inventoryItemId='" + inventoryItemId + "'" + ", productId='" + productId + "'" + ", quantity=" + quantity + ", price=" + price + '}'; }
    public String getInventoryItemId() { return inventoryItemId; }
    public String getProductId() { return productId; }
    public int getQuantity() { return quantity; }
    public double getPrice() { return price; }
}
