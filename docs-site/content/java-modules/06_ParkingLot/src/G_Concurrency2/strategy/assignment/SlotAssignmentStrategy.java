package G_Concurrency2.strategy.assignment;

import G_Concurrency2.model.ParkingSlot;
import G_Concurrency2.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}



