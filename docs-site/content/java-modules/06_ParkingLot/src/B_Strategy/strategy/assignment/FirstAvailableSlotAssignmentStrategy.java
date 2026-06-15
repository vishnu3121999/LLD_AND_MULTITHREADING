package B_Strategy.strategy.assignment;

import B_Strategy.model.ParkingSlot;
import B_Strategy.model.enums.SlotStatus;
import B_Strategy.model.enums.SlotType;

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
