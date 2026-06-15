package B_Strategy.strategy.assignment;

import B_Strategy.model.ParkingSlot;
import B_Strategy.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}
