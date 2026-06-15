package G_Concurrency2.model;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class ParkingLot {
    private final String parkingLotId;
    private final String name;
    private final Set<String> parkingFloorSet;

    public ParkingLot(String parkingLotId, String name) {
        this.parkingLotId = parkingLotId;
        this.name = name;
        this.parkingFloorSet = new CopyOnWriteArraySet<>();
    }

    public void addParkingFloor(String parkingFloorId) {
        parkingFloorSet.add(parkingFloorId);
    }

    @Override
    public String toString() {
        return "ParkingLot{" + "parkingLotId='" + parkingLotId + "'" + ", name='" + name + "'" + ", parkingFloorSet=" + parkingFloorSet + '}';
    }

    public String getParkingLotId() { return parkingLotId; }
    public String getName() { return name; }
    public Set<String> getParkingFloorList() { return Collections.unmodifiableSet(parkingFloorSet); }
}




