package E_OrchestrationValidations.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ParkingFloor {
    private final String parkingFloorId;
    private final String name;
    private final List<String> parkingSlotList;

    public ParkingFloor(String parkingFloorId, String name) {
        this.parkingFloorId = parkingFloorId;
        this.name = name;
        this.parkingSlotList = new ArrayList<>();
    }

    public void addParkingSlot(String parkingSlotId) { parkingSlotList.add(parkingSlotId); }

    @Override
    public String toString() {
        return "ParkingFloor{" + "parkingFloorId='" + parkingFloorId + "'" + ", name='" + name + "'" + ", parkingSlotList=" + parkingSlotList + '}';
    }

    public String getParkingFloorId() { return parkingFloorId; }
    public String getName() { return name; }
    public List<String> getParkingSlotList() { return Collections.unmodifiableList(parkingSlotList); }
}




