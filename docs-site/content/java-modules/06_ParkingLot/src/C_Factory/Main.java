package C_Factory;

import C_Factory.datastore.DataStore;
import C_Factory.datastore.InMemoryDataStore;
import C_Factory.model.Payment;
import C_Factory.model.UPIPayment;
import C_Factory.model.enums.SlotType;
import C_Factory.model.enums.VehicleType;
import C_Factory.payment.PaymentProcessor;
import C_Factory.payment.PaymentStrategyFactory;
import C_Factory.pricing.HourlyFeeCalculationStrategy;
import C_Factory.service.ParkingLotFacade;
import C_Factory.strategy.assignment.FirstAvailableSlotAssignmentStrategy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Parking Lot Factory Demo ===");
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
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}


