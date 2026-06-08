package A_basic.model;

public class Product {
    private final String productId;
    private final String name;
    private final String brand;
    public Product(String productId, String name, String brand) { this.productId = productId; this.name = name; this.brand = brand; }
    @Override public String toString() { return "Product{" + "productId='" + productId + "'" + ", name='" + name + "'" + ", brand='" + brand + "'" + '}'; }
    public String getProductId() { return productId; }
    public String getName() { return name; }
    public String getBrand() { return brand; }
}
