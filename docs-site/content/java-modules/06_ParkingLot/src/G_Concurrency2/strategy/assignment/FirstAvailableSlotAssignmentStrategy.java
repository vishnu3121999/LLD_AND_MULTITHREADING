package G_Concurrency2.strategy.assignment;

import G_Concurrency2.model.ParkingSlot;
import G_Concurrency2.model.enums.SlotStatus;
import G_Concurrency2.model.enums.SlotType;

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



