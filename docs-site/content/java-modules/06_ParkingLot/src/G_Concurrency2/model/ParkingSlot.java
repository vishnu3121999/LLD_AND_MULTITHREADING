package G_Concurrency2.model;

import G_Concurrency2.model.enums.SlotStatus;
import G_Concurrency2.model.enums.SlotType;

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
        validateCanVacate();
        this.vehicleId = null;
        this.slotStatus = SlotStatus.AVAILABLE;
    }

    public void validateCanVacate() {
        if (slotStatus != SlotStatus.OCCUPIED) {
            throw new IllegalStateException("Parking slot can only be vacated from OCCUPIED state: " + parkingSlotId);
        }
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




