package D_ExceptionHandlingV2.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ParkingLot {
    private final String parkingLotId;
    private final String name;
    private final List<String> parkingFloorList;

    public ParkingLot(String parkingLotId, String name) {
        this.parkingLotId = parkingLotId;
        this.name = name;
        this.parkingFloorList = new ArrayList<>();
    }

    public void addParkingFloor(String parkingFloorId) {
        parkingFloorList.add(parkingFloorId);
    }

    @Override
    public String toString() {
        return "ParkingLot{" + "parkingLotId='" + parkingLotId + "'" + ", name='" + name + "'" + ", parkingFloorList=" + parkingFloorList + '}';
    }

    public String getParkingLotId() { return parkingLotId; }
    public String getName() { return name; }
    public List<String> getParkingFloorList() { return Collections.unmodifiableList(parkingFloorList); }
}




