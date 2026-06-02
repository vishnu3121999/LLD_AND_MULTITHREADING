package D_ExceptionHandling;

import D_ExceptionHandling.change.GreedyChangeCalculationStrategy;
import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.datastore.InMemoryDataStore;
import D_ExceptionHandling.dispatcher.DispatcherService;
import D_ExceptionHandling.model.CashPayment;
import D_ExceptionHandling.model.Payment;
import D_ExceptionHandling.model.Product;
import D_ExceptionHandling.model.Rack;
import D_ExceptionHandling.model.VendingMachine;
import D_ExceptionHandling.model.enums.Coin;
import D_ExceptionHandling.payment.PaymentProcessor;
import D_ExceptionHandling.payment.PaymentStrategyFactory;
import D_ExceptionHandling.service.VendingMachineFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        try {
            runDemo();
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static void runDemo() {
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
