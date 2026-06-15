package F_Concurrency1.strategy.assignment;

import F_Concurrency1.model.ParkingSlot;
import F_Concurrency1.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}



