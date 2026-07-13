package E_OrchestrationValidations;

import E_OrchestrationValidations.datastore.DataStore;
import E_OrchestrationValidations.datastore.InMemoryDataStore;
import E_OrchestrationValidations.model.Payment;
import E_OrchestrationValidations.model.UPIPayment;
import E_OrchestrationValidations.model.enums.SlotType;
import E_OrchestrationValidations.model.enums.VehicleType;
import E_OrchestrationValidations.payment.PaymentProcessor;
import E_OrchestrationValidations.payment.PaymentStrategyFactory;
import E_OrchestrationValidations.pricing.HourlyFeeCalculationStrategy;
import E_OrchestrationValidations.service.ParkingLotFacade;
import E_OrchestrationValidations.strategy.assignment.FirstAvailableSlotAssignmentStrategy;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("=== Parking Lot Orchestration Validations Demo ===");
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




