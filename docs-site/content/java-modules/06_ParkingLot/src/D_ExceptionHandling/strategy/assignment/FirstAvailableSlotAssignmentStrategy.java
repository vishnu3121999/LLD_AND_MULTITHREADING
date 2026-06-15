package D_ExceptionHandling.strategy.assignment;

import D_ExceptionHandling.model.ParkingSlot;
import D_ExceptionHandling.model.enums.SlotStatus;
import D_ExceptionHandling.model.enums.SlotType;

import java.util.List;

public class FirstAvailableSlotAssignmentStrategy implements SlotAssignmentStrategy {
    @Override
    public ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType) {
        for (ParkingSlot parkingSlot : parkingSlotList) {
            if (parkingSlot.getSlotType() == slotType && parkingSlot.getSlotStatus() == SlotStatus.AVAILABLE) {
                return parkingSlot;
            }
        }
        return null;
    }
}


