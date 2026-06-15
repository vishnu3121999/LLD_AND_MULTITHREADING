package E_OrchestrationValidations.strategy.assignment;

import E_OrchestrationValidations.model.ParkingSlot;
import E_OrchestrationValidations.model.enums.SlotStatus;
import E_OrchestrationValidations.model.enums.SlotType;

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



