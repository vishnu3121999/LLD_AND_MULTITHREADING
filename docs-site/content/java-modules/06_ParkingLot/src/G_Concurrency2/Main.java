package G_Concurrency2;

import G_Concurrency2.datastore.DataStore;
import G_Concurrency2.datastore.InMemoryDataStore;
import G_Concurrency2.model.Payment;
import G_Concurrency2.model.UPIPayment;
import G_Concurrency2.model.enums.SlotType;
import G_Concurrency2.model.enums.VehicleType;
import G_Concurrency2.payment.PaymentProcessor;
import G_Concurrency2.payment.PaymentStrategyFactory;
import G_Concurrency2.pricing.HourlyFeeCalculationStrategy;
import G_Concurrency2.service.ParkingLotFacade;
import G_Concurrency2.strategy.assignment.FirstAvailableSlotAssignmentStrategy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("=== Parking Lot Concurrency2 Demo ===");
            DataStore dataStore = new InMemoryDataStore();
            PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory());
            ParkingLotFacade facade = new ParkingLotFacade(
                    dataStore,
                    paymentProcessor,
                    new FirstAvailableSlotAssignmentStrategy(),
                    new HourlyFeeCalculationStrategy()
            );

            String parkingLotId = id("parking-lot");
            String floorId = id("floor");
            String mediumSlotId = id("slot");
            String smallSlotId = id("slot");
            String vehicleId = id("vehicle");

            facade.addParkingLot(parkingLotId, "Downtown Parking");
            facade.addParkingFloor(parkingLotId, floorId, "Ground Floor");
            facade.addParkingSlot(floorId, mediumSlotId, "G-01", SlotType.MEDIUM);
            facade.addParkingSlot(floorId, smallSlotId, "G-02", SlotType.SMALL);

            String ticketId = facade.parkVehicle(parkingLotId, vehicleId, "KA-01-AB-1234", VehicleType.CAR);
            System.out.println(dataStore.getParkingTicket(ticketId));
            System.out.println(dataStore.getParkingSlot(mediumSlotId));
            System.out.println(facade.unparkVehicle(ticketId));
            System.out.println(dataStore.getParkingSlot(mediumSlotId));
            Payment payment = new UPIPayment(dataStore.getParkingTicket(ticketId).getAmount(), "driver@upi");
            System.out.println(facade.pay(ticketId, payment));
            System.out.println(payment);
            System.out.println(dataStore.getParkingTicket(ticketId));
            runSameMethodConcurrencyDemo();
            runSharedEntityConcurrencyDemo();
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            System.out.println("Demo interrupted: " + exception.getMessage());
        }
    }

    private static void runSameMethodConcurrencyDemo() throws InterruptedException {
        System.out.println("=== Same Method Race Demo ===");

        DataStore adminDataStore = new InMemoryDataStore();
        ParkingLotFacade adminFacade = newFacade(adminDataStore);
        String duplicateLotId = id("parking-lot");
        runConcurrently(
                () -> runDemoCall("admin-1 addParkingLot", () -> adminFacade.addParkingLot(duplicateLotId, "Downtown Parking")),
                () -> runDemoCall("admin-2 addParkingLot", () -> adminFacade.addParkingLot(duplicateLotId, "Downtown Parking"))
        );

        DataStore parkingDataStore = new InMemoryDataStore();
        ParkingLotFacade parkingFacade = newFacade(parkingDataStore);
        String parkingLotId = id("parking-lot");
        String floorId = id("floor");
        String slotId = id("slot");
        parkingFacade.addParkingLot(parkingLotId, "Concurrency Lot");
        parkingFacade.addParkingFloor(parkingLotId, floorId, "Ground Floor");
        parkingFacade.addParkingSlot(floorId, slotId, "G-01", SlotType.MEDIUM);
        runConcurrently(
                () -> runDemoCall("park-1", () -> System.out.println(parkingFacade.parkVehicle(parkingLotId, id("vehicle"), "KA-01-CC-1001", VehicleType.CAR))),
                () -> runDemoCall("park-2", () -> System.out.println(parkingFacade.parkVehicle(parkingLotId, id("vehicle"), "KA-01-CC-1002", VehicleType.CAR)))
        );
        System.out.println(parkingDataStore.getParkingSlot(slotId));
    }

    private static void runSharedEntityConcurrencyDemo() throws InterruptedException {
        System.out.println("=== Shared Entity Race Demo ===");

        DataStore dataStore = new InMemoryDataStore();
        ParkingLotFacade facade = newFacade(dataStore);
        String parkingLotId = id("parking-lot");
        String floorId = id("floor");
        String slotId = id("slot");
        String vehicleId = id("vehicle");
        facade.addParkingLot(parkingLotId, "Shared Entity Lot");
        facade.addParkingFloor(parkingLotId, floorId, "Ground Floor");
        facade.addParkingSlot(floorId, slotId, "G-01", SlotType.MEDIUM);
        String ticketId = facade.parkVehicle(parkingLotId, vehicleId, "KA-01-SH-1001", VehicleType.CAR);

        runConcurrently(
                () -> runDemoCall("unparkVehicle", () -> System.out.println(facade.unparkVehicle(ticketId))),
                () -> runDemoCall("parkVehicle", () -> System.out.println(facade.parkVehicle(parkingLotId, id("vehicle"), "KA-01-SH-1002", VehicleType.CAR)))
        );
        System.out.println(dataStore.getParkingSlot(slotId));
    }

    private static ParkingLotFacade newFacade(DataStore dataStore) {
        return new ParkingLotFacade(
                dataStore,
                new PaymentProcessor(new PaymentStrategyFactory()),
                new FirstAvailableSlotAssignmentStrategy(),
                new HourlyFeeCalculationStrategy()
        );
    }

    private static void runConcurrently(Runnable first, Runnable second) throws InterruptedException {
        Thread firstThread = new Thread(first);
        Thread secondThread = new Thread(second);
        firstThread.start();
        secondThread.start();
        firstThread.join();
        secondThread.join();
    }

    private static void runDemoCall(String label, Runnable action) {
        try {
            action.run();
            System.out.println(label + " succeeded");
        } catch (RuntimeException exception) {
            System.out.println(label + " failed: " + exception.getMessage());
        }
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}




