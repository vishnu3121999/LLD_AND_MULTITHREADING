package com.example.vm.database;


import com.example.vm.model.Product;
import com.example.vm.model.Rack;

import java.util.HashMap;
import java.util.Map;

public class DataStore {
    private Map<String, Rack> racks;
    private Map<String, Product> products;

    public DataStore(){
        racks = new HashMap<>();
        products = new HashMap<>();
    }

    public Map<String, Rack> getRacks() {
        return racks;
    }

    public void setRacks(Map<String, Rack> racks) {
        this.racks = racks;
    }

    public Map<String, Product> getProducts() {
        return products;
    }

    public void setProducts(Map<String, Product> products) {
        this.products = products;
    }
}

