package D_ExceptionHandling.model;

import D_ExceptionHandling.model.enums.SlotStatus;
import D_ExceptionHandling.model.enums.SlotType;

public class ParkingSlot {
    private final String parkingSlotId;
    private final String number;
    private final SlotType slotType;
    private SlotStatus slotStatus;
    private String vehicleId;

    public ParkingSlot(String parkingSlotId, String number, SlotType slotType) {
        this.parkingSlotId = parkingSlotId;
        this.number = number;
        this.slotType = slotType;
        this.slotStatus = SlotStatus.AVAILABLE;
    }

    public void occupy(String vehicleId) {
        if (slotStatus != SlotStatus.AVAILABLE) {
            throw new IllegalStateException("Parking slot can only be occupied from AVAILABLE state: " + parkingSlotId);
        }
        this.vehicleId = vehicleId;
        this.slotStatus = SlotStatus.OCCUPIED;
    }

    public void vacate() {
        if (slotStatus != SlotStatus.OCCUPIED) {
            throw new IllegalStateException("Parking slot can only be vacated from OCCUPIED state: " + parkingSlotId);
        }
        this.vehicleId = null;
        this.slotStatus = SlotStatus.AVAILABLE;
    }

    @Override
    public String toString() {
        return "ParkingSlot{" + "parkingSlotId='" + parkingSlotId + "'" + ", number='" + number + "'" + ", slotType=" + slotType + ", slotStatus=" + slotStatus + ", vehicleId='" + vehicleId + "'" + '}';
    }

    public String getParkingSlotId() { return parkingSlotId; }
    public String getNumber() { return number; }
    public SlotType getSlotType() { return slotType; }
    public SlotStatus getSlotStatus() { return slotStatus; }
    public String getVehicleId() { return vehicleId; }
}



