package D_ExceptionHandling.service;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.dispatcher.DispatcherService;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.Product;
import D_ExceptionHandling.model.Rack;
import D_ExceptionHandling.model.VendingMachine;
import D_ExceptionHandling.model.enums.Coin;
import D_ExceptionHandling.payment.PaymentProcessor;

import java.util.Map;
import java.util.NoSuchElementException;

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
        Rack rack = getRequiredRack(rackId);
        Product product = getRequiredProduct(rack.getProductId());
        validateRackHasProduct(rack);
        validateRackHasStock(rack);
        dataStore.getVendingMachine().selectRack(rackId);
        return product.getPrice();
    }

    public Product pay(Payment payment) {
        requireNotNull(payment, "payment");
        requirePositive(payment.getAmount(), "payment amount");
        Product product = null;
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack selectedRack = getRequiredRack(vendingMachine.getSelectedRackId());
        Product selectedProduct = getRequiredProduct(selectedRack.getProductId());
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
        requireNotNull(coin, "coin");
        requirePositive(count, "count");
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        vendingMachine.addCoin(coin, count);
    }

    public void addProduct(String productId, String name, int price) {
        requireText(productId, "productId");
        requireText(name, "name");
        requirePositive(price, "price");
        if (dataStore.containsProduct(productId)) {
            throw new RuntimeException("Product already exists: " + productId);
        }
        Product product = new Product(productId, name, price);
        dataStore.putProduct(product.getProductId(), product);
    }

    public void addRack(String rackId, int maxCount) {
        requireText(rackId, "rackId");
        requirePositive(maxCount, "maxCount");
        if (dataStore.containsRack(rackId)) {
            throw new RuntimeException("Rack already exists: " + rackId);
        }
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack rack = new Rack(rackId, maxCount);
        dataStore.putRack(rack.getRackId(), rack);
        vendingMachine.addRack(rackId);
    }

    public void addProductToRack(String rackId, String productId, int productCount) {
        requireText(productId, "productId");
        requirePositive(productCount, "productCount");
        Rack rack = getRequiredRack(rackId);
        Product product = getRequiredProduct(productId);
        validateRackCanAcceptProduct(rack, product.getProductId(), productCount);
        rack.addProduct(product.getProductId());
        rack.addProductCount(productCount);
    }

    public void addProductCount(String rackId, int productCount) {
        requirePositive(productCount, "productCount");
        Rack rack = getRequiredRack(rackId);
        validateRackCanAcceptProduct(rack, rack.getProductId(), productCount);
        rack.addProductCount(productCount);
    }

    private void requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requireNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }

    private void requirePositive(int value, String fieldName) {
        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    private Product getRequiredProduct(String productId) {
        requireText(productId, "productId");
        Product product = dataStore.getProduct(productId);
        if (product == null) {
            throw new NoSuchElementException("Product not found: " + productId);
        }
        return product;
    }

    private Rack getRequiredRack(String rackId) {
        requireText(rackId, "rackId");
        Rack rack = dataStore.getRack(rackId);
        if (rack == null) {
            throw new NoSuchElementException("Rack not found: " + rackId);
        }
        return rack;
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
