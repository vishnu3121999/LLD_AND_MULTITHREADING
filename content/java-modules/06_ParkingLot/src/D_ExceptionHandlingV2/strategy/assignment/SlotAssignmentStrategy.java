package D_ExceptionHandlingV2.strategy.assignment;

import D_ExceptionHandlingV2.model.ParkingSlot;
import D_ExceptionHandlingV2.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}



