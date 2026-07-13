package E_OrchestrationValidations.strategy.assignment;

import E_OrchestrationValidations.model.ParkingSlot;
import E_OrchestrationValidations.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}



