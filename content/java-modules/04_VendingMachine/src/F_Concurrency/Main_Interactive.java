package F_Concurrency;

import F_Concurrency.change.GreedyChangeCalculationStrategy;
import F_Concurrency.datastore.DataStore;
import F_Concurrency.datastore.InMemoryDataStore;
import F_Concurrency.dispatcher.DispatcherService;
import F_Concurrency.model.CashPayment;
import F_Concurrency.model.Payment;
import F_Concurrency.model.Product;
import F_Concurrency.model.Rack;
import F_Concurrency.model.UPIPayment;
import F_Concurrency.model.VendingMachine;
import F_Concurrency.model.enums.Coin;
import F_Concurrency.payment.PaymentProcessor;
import F_Concurrency.payment.PaymentStrategyFactory;
import F_Concurrency.service.VendingMachineFacade;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

public class Main_Interactive {
    public static void main(String[] args) {
        try {
            VendingMachine vendingMachine = new VendingMachine("Office Pantry VM", new GreedyChangeCalculationStrategy());
            DataStore dataStore = new InMemoryDataStore(vendingMachine);
            PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory(dataStore));
            DispatcherService dispatcherService = new DispatcherService(dataStore);
            VendingMachineFacade facade = new VendingMachineFacade(dataStore, paymentProcessor, dispatcherService);
            setup(facade);

            Scanner scanner = new Scanner(System.in);
            boolean running = true;

            while (running) {
                System.out.println();
                System.out.println("Machine state: " + vendingMachine.getVendingMachineState());
                System.out.println("1. View available products");
                System.out.println("2. Select product");
                System.out.println("3. Pay cash");
                System.out.println("4. Pay UPI");
                System.out.println("5. Cancel transaction");
                System.out.println("0. Exit");
                System.out.print("Choose option: ");

                int option = readInt(scanner);

                try {
                    if (option == 1) {
                        printAvailableProducts(dataStore);
                    } else if (option == 2) {
                        System.out.print("Enter rack id: ");
                        String rackId = scanner.nextLine();
                        int price = facade.selectProduct(rackId);
                        System.out.println("Selected product price: " + price);
                    } else if (option == 3) {
                        Payment payment = new CashPayment(readCoins(scanner));
                        Product product = facade.pay(payment);
                        System.out.println("Payment: " + payment);
                        System.out.println("Dispensed product: " + product);
                    } else if (option == 4) {
                        System.out.print("Enter amount: ");
                        int amount = readInt(scanner);
                        System.out.print("Enter UPI id: ");
                        String upiId = scanner.nextLine();
                        Payment payment = new UPIPayment(amount, upiId);
                        Product product = facade.pay(payment);
                        System.out.println("Payment: " + payment);
                        System.out.println("Dispensed product: " + product);
                    } else if (option == 5) {
                        facade.cancel();
                        System.out.println("Transaction cancelled");
                    } else if (option == 0) {
                        running = false;
                    }
                } catch (RuntimeException exception) {
                    System.out.println(exception.getMessage());
                }
            }

            scanner.close();
        } catch (RuntimeException exception) {
            System.out.println(exception.getMessage());
        }
    }

    private static void setup(VendingMachineFacade facade) {
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
    }

    private static List<Coin> readCoins(Scanner scanner) {
        List<Coin> coinList = new ArrayList<>();
        for (Coin coin : Coin.values()) {
            System.out.print("Enter " + coin + " count: ");
            int count = readInt(scanner);
            for (int i = 0; i < count; i++) {
                coinList.add(coin);
            }
        }
        return coinList;
    }

    private static int readInt(Scanner scanner) {
        String line = scanner.nextLine().replaceAll("[^0-9-]", "").trim();
        while (line.isBlank()) {
            line = scanner.nextLine().replaceAll("[^0-9-]", "").trim();
        }
        return Integer.parseInt(line);
    }

    private static void printAvailableProducts(DataStore dataStore) {
        for (String rackId : dataStore.getVendingMachine().getRackList()) {
            Rack rack = dataStore.getRack(rackId);
            Product product = dataStore.getProduct(rack.getProductId());
            System.out.println(rack + " -> " + product);
        }
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
