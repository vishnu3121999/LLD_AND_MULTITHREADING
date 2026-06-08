package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.ParkingFloor;
import A_basic.model.ParkingLot;
import A_basic.model.ParkingSlot;
import A_basic.model.ParkingTicket;
import A_basic.model.Vehicle;
import A_basic.model.enums.SlotStatus;
import A_basic.model.enums.SlotType;
import A_basic.model.enums.VehicleType;

public class ParkingLotFacade {
    private final DataStore dataStore;

    public ParkingLotFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String parkVehicle(String parkingLotId, String vehicleId, String registrationNumber, VehicleType vehicleType, long entryTime) {
        Vehicle vehicle = new Vehicle(vehicleId, registrationNumber, vehicleType);
        dataStore.putVehicle(vehicle.getVehicleId(), vehicle);
        ParkingSlot parkingSlot = findAvailableSlot(parkingLotId, slotTypeFor(vehicleType));
        parkingSlot.parkVehicle(vehicleId);
        String parkingTicketId = "ticket-" + vehicleId;
        ParkingTicket parkingTicket = new ParkingTicket(parkingTicketId, vehicleId, parkingSlot.getParkingSlotId(), entryTime);
        dataStore.putParkingTicket(parkingTicket.getParkingTicketId(), parkingTicket);
        return parkingTicketId;
    }

    public ParkingTicket unparkVehicle(String parkingTicketId, long exitTime) {
        ParkingTicket parkingTicket = dataStore.getParkingTicket(parkingTicketId);
        ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingTicket.getParkingSlotId());
        parkingSlot.vacate();
        parkingTicket.close(exitTime, calculateAmount(parkingTicket.getEntryTime(), exitTime));
        return parkingTicket;
    }

    // System methods

    public ParkingSlot findAvailableSlot(String parkingLotId, SlotType slotType) {
        ParkingLot parkingLot = dataStore.getParkingLot(parkingLotId);
        for (String parkingFloorId : parkingLot.getParkingFloorList()) {
            ParkingFloor parkingFloor = dataStore.getParkingFloor(parkingFloorId);
            for (String parkingSlotId : parkingFloor.getParkingSlotList()) {
                ParkingSlot parkingSlot = dataStore.getParkingSlot(parkingSlotId);
                if (parkingSlot.getSlotType() == slotType && parkingSlot.getSlotStatus() == SlotStatus.AVAILABLE) {
                    return parkingSlot;
                }
            }
        }
        return null;
    }

    // Admin methods

    public void addParkingLot(String parkingLotId, String name) {
        ParkingLot parkingLot = new ParkingLot(parkingLotId, name);
        dataStore.putParkingLot(parkingLot.getParkingLotId(), parkingLot);
    }

    public void addParkingFloor(String parkingLotId, String parkingFloorId, String name) {
        ParkingFloor parkingFloor = new ParkingFloor(parkingFloorId, name);
        dataStore.putParkingFloor(parkingFloor.getParkingFloorId(), parkingFloor);
        dataStore.getParkingLot(parkingLotId).addParkingFloor(parkingFloorId);
    }

    public void addParkingSlot(String parkingFloorId, String parkingSlotId, String number, SlotType slotType) {
        ParkingSlot parkingSlot = new ParkingSlot(parkingSlotId, number, slotType);
        dataStore.putParkingSlot(parkingSlot.getParkingSlotId(), parkingSlot);
        dataStore.getParkingFloor(parkingFloorId).addParkingSlot(parkingSlotId);
    }

    // Util/helper methods

    private SlotType slotTypeFor(VehicleType vehicleType) {
        if (vehicleType == VehicleType.BIKE) return SlotType.BIKE;
        if (vehicleType == VehicleType.TRUCK) return SlotType.LARGE;
        return SlotType.COMPACT;
    }

    private double calculateAmount(long entryTime, long exitTime) {
        long hours = Math.max(1, (exitTime - entryTime + 59) / 60);
        return hours * 20.0;
    }
}
