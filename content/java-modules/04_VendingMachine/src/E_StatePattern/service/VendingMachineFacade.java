package E_StatePattern.service;

import E_StatePattern.datastore.DataStore;
import E_StatePattern.dispatcher.DispatcherService;
import E_StatePattern.model.Payment;
import E_StatePattern.model.Product;
import E_StatePattern.model.Rack;
import E_StatePattern.model.VendingMachine;
import E_StatePattern.model.enums.Coin;
import E_StatePattern.payment.PaymentProcessor;

import java.util.Map;

public class VendingMachineFacade {
    private final DataStore dataStore;
    private final PaymentProcessor paymentProcessor;
    private final DispatcherService dispatcherService;

    public VendingMachineFacade(DataStore dataStore, PaymentProcessor paymentProcessor, DispatcherService dispatcherService) {
        this.dataStore = dataStore;
        this.paymentProcessor = paymentProcessor;
        this.dispatcherService = dispatcherService;
    }

    // User methods

    public int selectProduct(String rackId) {
        Rack rack = dataStore.getRack(rackId);
        validateRackHasProduct(rack);
        validateRackHasStock(rack);
        Product product = dataStore.getProduct(rack.getProductId());
        dataStore.getVendingMachine().selectRack(rackId);
        return product.getPrice();
    }

    public Product pay(Payment payment) {
        Product product = null;
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack selectedRack = dataStore.getRack(vendingMachine.getSelectedRackId());
        Product selectedProduct = dataStore.getProduct(selectedRack.getProductId());
        validateRackHasProduct(selectedRack);
        validateRackHasStock(selectedRack);
        if (payment.getAmount() < selectedProduct.getPrice()) {
            throw new RuntimeException("Insufficient payment for product: " + selectedProduct.getProductId());
        }
        if (paymentProcessor.process(payment, selectedProduct.getPrice())) {
            Map<Coin, Integer> changeMap = vendingMachine.calculateChange(payment.getAmount() - selectedProduct.getPrice());
            vendingMachine.paymentCompleted();
            product = dispatcherService.dispatchProduct(selectedRack.getRackId());
            dispatcherService.dispatchChange(changeMap);
            vendingMachine.completeTransaction();
        } else {
            throw new RuntimeException("Payment failed for product: " + selectedProduct.getProductId());
        }
        return product;
    }

    public void cancel() {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        vendingMachine.cancelTransaction();
    }

    // System methods

    // Admin methods

    public void addCoin(Coin coin, int count) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        vendingMachine.addCoin(coin, count);
    }

    public void addProduct(String productId, String name, int price) {
        if (dataStore.containsProduct(productId)) {
            throw new RuntimeException("Product already exists: " + productId);
        }
        Product product = new Product(productId, name, price);
        dataStore.putProduct(product.getProductId(), product);
    }

    public void addRack(String rackId, int maxCount) {
        if (dataStore.containsRack(rackId)) {
            throw new RuntimeException("Rack already exists: " + rackId);
        }
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack rack = new Rack(rackId, maxCount);
        dataStore.putRack(rack.getRackId(), rack);
        vendingMachine.addRack(rackId);
    }

    public void addProductToRack(String rackId, String productId, int productCount) {
        Rack rack = dataStore.getRack(rackId);
        Product product = dataStore.getProduct(productId);
        validateRackCanAcceptProduct(rack, product.getProductId(), productCount);
        rack.addProduct(product.getProductId());
        rack.addProductCount(productCount);
    }

    public void addProductCount(String rackId, int productCount) {
        Rack rack = dataStore.getRack(rackId);
        validateRackCanAcceptProduct(rack, rack.getProductId(), productCount);
        rack.addProductCount(productCount);
    }

    private void validateRackHasProduct(Rack rack) {
        if (rack.getProductId() == null) {
            throw new RuntimeException("Rack has no product assigned: " + rack.getRackId());
        }
    }

    private void validateRackHasStock(Rack rack) {
        if (rack.getProductCount() <= 0) {
            throw new RuntimeException("Rack is out of stock: " + rack.getRackId());
        }
    }

    private void validateRackCanAcceptProduct(Rack rack, String productId, int productCount) {
        if (rack.getProductId() != null && !rack.getProductId().equals(productId)) {
            throw new RuntimeException("Rack already has product: " + rack.getRackId());
        }
        if (rack.getProductCount() + productCount > rack.getMaxCount()) {
            throw new RuntimeException("Rack capacity exceeded: " + rack.getRackId());
        }
    }
}
