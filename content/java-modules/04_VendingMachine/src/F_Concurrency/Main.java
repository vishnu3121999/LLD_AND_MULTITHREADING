package F_Concurrency;

import F_Concurrency.change.GreedyChangeCalculationStrategy;
import F_Concurrency.datastore.DataStore;
import F_Concurrency.datastore.InMemoryDataStore;
import F_Concurrency.dispatcher.DispatcherService;
import F_Concurrency.model.CashPayment;
import F_Concurrency.model.Payment;
import F_Concurrency.model.Product;
import F_Concurrency.model.Rack;
import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.Coin;
import F_Concurrency.payment.PaymentProcessor;
import F_Concurrency.payment.PaymentStrategyFactory;
import F_Concurrency.service.VendingMachineFacade;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

public class Main {
    public static void main(String[] args) {
        try {
            runDemo();
            runConcurrentDemo();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Demo interrupted");
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

    private static void runConcurrentDemo() throws InterruptedException {
        System.out.println();
        System.out.println("Concurrent purchase demo");
        VendingMachine vendingMachine = new VendingMachine("Concurrent VM", new GreedyChangeCalculationStrategy());
        DataStore dataStore = new InMemoryDataStore(vendingMachine);
        PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory(dataStore));
        DispatcherService dispatcherService = new DispatcherService(dataStore);
        VendingMachineFacade facade = new VendingMachineFacade(dataStore, paymentProcessor, dispatcherService);

        String waterProductId = id("product");
        String waterRackId = "C1";

        facade.addCoin(Coin.TEN, 10);
        facade.addProduct(waterProductId, "Water", 40);
        facade.addRack(waterRackId, 1);
        facade.addProductToRack(waterRackId, waterProductId, 1);

        AtomicReference<Product> user1Product = new AtomicReference<>();
        AtomicReference<Product> user2Product = new AtomicReference<>();
        AtomicReference<RuntimeException> user1Error = new AtomicReference<>();
        AtomicReference<RuntimeException> user2Error = new AtomicReference<>();

        Thread user1Thread = new Thread(() -> buyProduct(facade, waterRackId, user1Product, user1Error));
        Thread user2Thread = new Thread(() -> buyProduct(facade, waterRackId, user2Product, user2Error));

        user1Thread.start();
        user2Thread.start();
        user1Thread.join();
        user2Thread.join();

        printConcurrentPurchaseResult("user-1", user1Product.get(), user1Error.get());
        printConcurrentPurchaseResult("user-2", user2Product.get(), user2Error.get());
        printAvailableRacks("Available racks after concurrent purchase", dataStore);
        System.out.println("Machine after concurrent purchase: " + vendingMachine);
    }

    private static void buyProduct(VendingMachineFacade facade, String rackId, AtomicReference<Product> product,
                                   AtomicReference<RuntimeException> error) {
        try {
            facade.selectProduct(rackId);
            product.set(facade.pay(new CashPayment(List.of(Coin.FIFTY))));
        } catch (RuntimeException exception) {
            error.set(exception);
        }
    }

    private static void printConcurrentPurchaseResult(String userId, Product product, RuntimeException error) {
        if (product != null) {
            System.out.println(userId + " dispensed: " + product);
            return;
        }
        if (error != null) {
            System.out.println(userId + " failed: " + error.getMessage());
        }
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
