package D_ExceptionHandling.strategy.assignment;

import D_ExceptionHandling.model.ParkingSlot;
import D_ExceptionHandling.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}


