package F_Concurrency2.datastore;

import F_Concurrency2.model.Building;
import F_Concurrency2.model.Display;
import F_Concurrency2.model.Elevator;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryDataStore implements DataStore {
    private final Map<String, Building> buildingMap;
    private final Map<String, Elevator> elevatorMap;
    private final Map<String, Display> displayMap;

    public InMemoryDataStore() {
        this.buildingMap = new ConcurrentHashMap<>();
        this.elevatorMap = new ConcurrentHashMap<>();
        this.displayMap = new ConcurrentHashMap<>();
    }

    @Override
    public Building getBuilding(String key) {
        return buildingMap.get(key);
    }

    @Override
    public void putBuilding(String key, Building value) {
        buildingMap.put(key, value);
    }

    @Override
    public boolean containsBuilding(String key) {
        return buildingMap.containsKey(key);
    }

    @Override
    public Building removeBuilding(String key) {
        return buildingMap.remove(key);
    }

    @Override
    public Elevator getElevator(String key) {
        return elevatorMap.get(key);
    }

    @Override
    public void putElevator(String key, Elevator value) {
        elevatorMap.put(key, value);
    }

    @Override
    public boolean containsElevator(String key) {
        return elevatorMap.containsKey(key);
    }

    @Override
    public Elevator removeElevator(String key) {
        return elevatorMap.remove(key);
    }

    @Override
    public Display getDisplay(String key) {
        return displayMap.get(key);
    }

    @Override
    public void putDisplay(String key, Display value) {
        displayMap.put(key, value);
    }

    @Override
    public boolean containsDisplay(String key) {
        return displayMap.containsKey(key);
    }

    @Override
    public Display removeDisplay(String key) {
        return displayMap.remove(key);
    }

}
