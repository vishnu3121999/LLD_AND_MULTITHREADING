package G_Concurrency2.model;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class ParkingFloor {
    private final String parkingFloorId;
    private final String name;
    private final Set<String> parkingSlotSet;

    public ParkingFloor(String parkingFloorId, String name) {
        this.parkingFloorId = parkingFloorId;
        this.name = name;
        this.parkingSlotSet = new CopyOnWriteArraySet<>();
    }

    public void addParkingSlot(String parkingSlotId) { parkingSlotSet.add(parkingSlotId); }

    @Override
    public String toString() {
        return "ParkingFloor{" + "parkingFloorId='" + parkingFloorId + "'" + ", name='" + name + "'" + ", parkingSlotSet=" + parkingSlotSet + '}';
    }

    public String getParkingFloorId() { return parkingFloorId; }
    public String getName() { return name; }
    public Set<String> getParkingSlotList() { return Collections.unmodifiableSet(parkingSlotSet); }
}




