package B_Strategy;

import B_Strategy.datastore.DataStore;
import B_Strategy.datastore.InMemoryDataStore;
import B_Strategy.model.Payment;
import B_Strategy.model.UPIPayment;
import B_Strategy.model.enums.SlotType;
import B_Strategy.model.enums.VehicleType;
import B_Strategy.payment.PaymentProcessor;
import B_Strategy.pricing.HourlyFeeCalculationStrategy;
import B_Strategy.service.ParkingLotFacade;
import B_Strategy.strategy.assignment.FirstAvailableSlotAssignmentStrategy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Parking Lot Strategy Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        PaymentProcessor paymentProcessor = new PaymentProcessor();
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
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}

