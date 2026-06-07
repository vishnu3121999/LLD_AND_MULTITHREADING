package F_Concurrency2.model;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class Building {
    private final String buildingId;
    private final String name;
    private final Set<String> elevatorList;

    public Building(String buildingId, String name) {
        this.buildingId = buildingId;
        this.name = name;
        this.elevatorList = new CopyOnWriteArraySet<>();
    }

    public void addElevator(String elevatorId) {
        elevatorList.add(elevatorId);
    }

    @Override
    public String toString() {
        return "Building{" +
                "buildingId='" + buildingId + '\'' +
                ", name='" + name + '\'' +
                ", elevatorList=" + elevatorList +
                '}';
    }

    public String getBuildingId() {
        return buildingId;
    }

    public String getName() {
        return name;
    }

    public Set<String> getElevatorList() {
        return Collections.unmodifiableSet(elevatorList);
    }
}
