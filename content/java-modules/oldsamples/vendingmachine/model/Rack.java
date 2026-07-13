package com.example.vm.model;

public class Rack {
    private String id;
    private String productId;
    private int productCount;

    public Rack( String id,String productId, int productCount) {
        this.productId = productId;
        this.productCount = productCount;
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getProductCount() {
        return productCount;
    }

    public void setProductCount(int productCount) {
        this.productCount = productCount;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }
}

