package F_Concurrency1.strategy.assignment;

import F_Concurrency1.model.ParkingSlot;
import F_Concurrency1.model.enums.SlotStatus;
import F_Concurrency1.model.enums.SlotType;

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



