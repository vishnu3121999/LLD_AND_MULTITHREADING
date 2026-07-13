package D_ExceptionHandlingV2;

import D_ExceptionHandlingV2.datastore.DataStore;
import D_ExceptionHandlingV2.datastore.InMemoryDataStore;
import D_ExceptionHandlingV2.model.Payment;
import D_ExceptionHandlingV2.model.UPIPayment;
import D_ExceptionHandlingV2.model.enums.SlotType;
import D_ExceptionHandlingV2.model.enums.VehicleType;
import D_ExceptionHandlingV2.payment.PaymentProcessor;
import D_ExceptionHandlingV2.payment.PaymentStrategyFactory;
import D_ExceptionHandlingV2.pricing.HourlyFeeCalculationStrategy;
import D_ExceptionHandlingV2.service.ParkingLotFacade;
import D_ExceptionHandlingV2.strategy.assignment.FirstAvailableSlotAssignmentStrategy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("=== Parking Lot Exception Handling Demo ===");
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
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}




