package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.enums.SlotType;
import A_basic.model.enums.VehicleType;
import A_basic.service.ParkingLotFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Parking Lot Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        ParkingLotFacade facade = new ParkingLotFacade(dataStore);

        String parkingLotId = id("parking-lot");
        String floorId = id("floor");
        String compactSlotId = id("slot");
        String bikeSlotId = id("slot");
        String vehicleId = id("vehicle");

        facade.addParkingLot(parkingLotId, "Downtown Parking");
        facade.addParkingFloor(parkingLotId, floorId, "Ground Floor");
        facade.addParkingSlot(floorId, compactSlotId, "G-01", SlotType.COMPACT);
        facade.addParkingSlot(floorId, bikeSlotId, "G-02", SlotType.BIKE);

        String ticketId = facade.parkVehicle(parkingLotId, vehicleId, "KA-01-AB-1234", VehicleType.CAR, 10);
        System.out.println(dataStore.getParkingTicket(ticketId));
        System.out.println(dataStore.getParkingSlot(compactSlotId));
        System.out.println(facade.unparkVehicle(ticketId, 75));
        System.out.println(dataStore.getParkingSlot(compactSlotId));
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
