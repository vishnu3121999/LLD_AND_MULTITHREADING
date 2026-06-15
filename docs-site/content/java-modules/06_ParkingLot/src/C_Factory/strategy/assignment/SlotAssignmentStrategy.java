package C_Factory.strategy.assignment;

import C_Factory.model.ParkingSlot;
import C_Factory.model.enums.SlotType;

import java.util.List;

public interface SlotAssignmentStrategy {
    ParkingSlot assignSlot(List<ParkingSlot> parkingSlotList, SlotType slotType);
}

