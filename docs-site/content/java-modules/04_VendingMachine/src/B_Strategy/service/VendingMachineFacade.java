package B_Strategy.service;

import B_Strategy.datastore.DataStore;
import B_Strategy.dispatcher.DispatcherService;
import B_Strategy.model.Payment;
import B_Strategy.model.Product;
import B_Strategy.model.Rack;
import B_Strategy.model.VendingMachine;
import B_Strategy.model.enums.Coin;
import B_Strategy.payment.PaymentProcessor;

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
        Product product = dataStore.getProduct(rack.getProductId());
        dataStore.getVendingMachine().selectRack(rackId);
        return product.getPrice();
    }

    public Product pay(Payment payment) {
        Product product = null;
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack selectedRack = dataStore.getRack(vendingMachine.getSelectedRackId());
        Product selectedProduct = dataStore.getProduct(selectedRack.getProductId());
        if (paymentProcessor.process(payment, selectedProduct.getPrice())) {
            Map<Coin, Integer> changeMap = vendingMachine.calculateChange(payment.getAmount() - selectedProduct.getPrice());
            vendingMachine.paymentCompleted();
            product = dispatcherService.dispatchProduct(selectedRack.getRackId());
            dispatcherService.dispatchChange(changeMap);
            vendingMachine.completeTransaction();
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
        Product product = new Product(productId, name, price);
        dataStore.putProduct(product.getProductId(), product);
    }

    public void addRack(String rackId, int maxCount) {
        VendingMachine vendingMachine = dataStore.getVendingMachine();
        Rack rack = new Rack(rackId, maxCount);
        dataStore.putRack(rack.getRackId(), rack);
        vendingMachine.addRack(rackId);
    }

    public void addProductToRack(String rackId, String productId, int productCount) {
        Rack rack = dataStore.getRack(rackId);
        rack.addProduct(productId);
        rack.addProductCount(productCount);
    }

    public void addProductCount(String rackId, int productCount) {
        Rack rack = dataStore.getRack(rackId);
        rack.addProductCount(productCount);
    }
}
