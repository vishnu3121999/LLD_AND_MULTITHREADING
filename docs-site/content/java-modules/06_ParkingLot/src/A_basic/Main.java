package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.Payment;
import A_basic.model.UPIPayment;
import A_basic.model.enums.SlotType;
import A_basic.model.enums.VehicleType;
import A_basic.payment.PaymentProcessor;
import A_basic.service.ParkingLotFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Parking Lot Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        PaymentProcessor paymentProcessor = new PaymentProcessor();
        ParkingLotFacade facade = new ParkingLotFacade(dataStore, paymentProcessor);

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
