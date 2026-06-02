
package com.example.vm.service;

import com.example.vm.database.DataStore;
import com.example.vm.factory.PaymentFactory;
import com.example.vm.model.PaymentType;
import com.example.vm.model.Product;
import com.example.vm.state.IdleState;
import com.example.vm.state.VendingMachineState;
import java.util.UUID;


public class VendingMachineFacade {
    private DataStore db;
    private PaymentFactory paymentFactory;
    private VendingMachineState currentState;
    private String selectedProduct;

    public VendingMachineFacade(DataStore db) {
        this.db = db;
        this.paymentFactory = new PaymentFactory();
        this.currentState = new IdleState(this);
    }

    // Admin APIs
    public void addProduct(String name, double price) {
        String productId = UUID.randomUUID().toString();
        Product product = new Product(productId, name, price);
        db.getProducts().put(productId, product);
    }
    public void removeProduct(String id){
        db.getProducts().remove(id);
    }

    // User APIs
    public void selectProduct(String productId) {
        currentState.selectProduct(productId);
    }
    public boolean pay(PaymentType type) {
        return currentState.pay(type);
    }
    public void cancel() {currentState.cancel();}

    // System APIs - can be seperated to dedicated services
    public boolean processPayment(PaymentType type) {
        return paymentFactory.getPaymentStrategy(type).processPayment();
    }
    public void dispatchProduct(String productId) {
        System.out.println("Dispatched product - " + productId);
    }
    public void dispatchChange(double amount) {
        System.out.println("Dispatched amount -"+amount);
    }

    // ---- Methods used by concrent state classes = Getters/Setters of Facade----
    public void setState(VendingMachineState state) {
        this.currentState = state;
    }
    public DataStore getDb() {
        return db;
    }
    public void setSelectedProduct(String productId) {
        this.selectedProduct = productId;
    }
    public String getSelectedProduct() {
        return selectedProduct;
    }
    public void clearSelection() {
        this.selectedProduct = null;
    }
}

