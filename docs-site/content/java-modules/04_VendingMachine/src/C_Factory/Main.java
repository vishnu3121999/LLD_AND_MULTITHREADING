package C_Factory;

import C_Factory.change.GreedyChangeCalculationStrategy;
import C_Factory.datastore.DataStore;
import C_Factory.datastore.InMemoryDataStore;
import C_Factory.dispatcher.DispatcherService;
import C_Factory.model.CashPayment;
import C_Factory.model.Payment;
import C_Factory.model.Product;
import C_Factory.model.Rack;
import C_Factory.model.VendingMachine;
import C_Factory.model.enums.Coin;
import C_Factory.payment.PaymentProcessor;
import C_Factory.payment.PaymentStrategyFactory;
import C_Factory.service.VendingMachineFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        VendingMachine vendingMachine = new VendingMachine("Office Pantry VM", new GreedyChangeCalculationStrategy());
        DataStore dataStore = new InMemoryDataStore(vendingMachine);
        PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory(dataStore));
        DispatcherService dispatcherService = new DispatcherService(dataStore);
        VendingMachineFacade facade = new VendingMachineFacade(dataStore, paymentProcessor, dispatcherService);

        String chipsProductId = id("product");
        String sodaProductId = id("product");
        String juiceProductId = id("product");
        String chipsRackId = "A1";
        String sodaRackId = "A2";
        String juiceRackId = "B1";

        facade.addCoin(Coin.ONE, 10);
        facade.addCoin(Coin.TWO, 10);
        facade.addCoin(Coin.FIVE, 10);
        facade.addCoin(Coin.TEN, 10);
        facade.addCoin(Coin.TWENTY, 5);
        facade.addCoin(Coin.FIFTY, 5);

        facade.addProduct(chipsProductId, "Chips", 40);
        facade.addProduct(sodaProductId, "Soda", 35);
        facade.addProduct(juiceProductId, "Juice", 50);

        facade.addRack(chipsRackId, 5);
        facade.addRack(sodaRackId, 5);
        facade.addRack(juiceRackId, 5);

        facade.addProductToRack(chipsRackId, chipsProductId, 5);
        facade.addProductToRack(sodaRackId, sodaProductId, 3);
        facade.addProductToRack(juiceRackId, juiceProductId, 2);

        printAvailableRacks("Available racks before purchase", dataStore);
        System.out.println("Machine before purchase: " + vendingMachine);
        System.out.println();

        int selectedProductPrice = facade.selectProduct(chipsRackId);
        System.out.println("Selected product price: " + selectedProductPrice);
        System.out.println("Machine after selection: " + vendingMachine);

        Payment payment = new CashPayment(List.of(Coin.FIFTY));
        Product dispensedProduct = facade.pay(payment);
        System.out.println("Payment after processing: " + payment);
        System.out.println("Dispensed product: " + dispensedProduct);
        System.out.println("Machine after payment: " + vendingMachine);
        System.out.println();

        printAvailableRacks("Available racks after purchase", dataStore);

        int cancelledProductPrice = facade.selectProduct(sodaRackId);
        System.out.println("Selected product price before cancel: " + cancelledProductPrice);
        facade.cancel();
        System.out.println("Machine after cancel: " + vendingMachine);
    }

    private static void printAvailableRacks(String label, DataStore dataStore) {
        System.out.println(label);
        for (String rackId : dataStore.getVendingMachine().getRackList()) {
            Rack rack = dataStore.getRack(rackId);
            Product product = dataStore.getProduct(rack.getProductId());
            System.out.println(rack + " -> " + product);
        }
        System.out.println();
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
