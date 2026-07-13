package D_ExceptionHandlingV2.model;

public class Rack {
    private final String rackId;
    private String productId;
    private int productCount;
    private final int maxCount;

    public Rack(String rackId, int maxCount) {
        this.rackId = rackId;
        this.productId = null;
        this.productCount = 0;
        this.maxCount = maxCount;
    }

    public void addProduct(String productId) {
        this.productId = productId;
    }

    public void addProductCount(int productCount) {
        this.productCount += productCount;
    }

    public void reduceProductCount() {
        this.productCount--;
    }

    @Override
    public String toString() {
        return "Rack{" +
                "rackId='" + rackId + '\'' +
                ", productId='" + productId + '\'' +
                ", productCount=" + productCount +
                ", maxCount=" + maxCount +
                '}';
    }

    public String getRackId() {
        return rackId;
    }

    public String getProductId() {
        return productId;
    }

    public int getProductCount() {
        return productCount;
    }

    public int getMaxCount() {
        return maxCount;
    }
}
