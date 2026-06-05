package database;

import models.Elevator;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataStore {
    private Map<String, Elevator> elevatorMap;

    public DataStore() {
        this.elevatorMap = new HashMap<>();
    }

    public Elevator getElevator(String key) {
        return elevatorMap.get(key);
    }

    public void putElevator(String key, Elevator value) {
        elevatorMap.put(key, value);
    }

    public boolean containsElevator(String key) {
        return elevatorMap.containsKey(key);
    }

    public Elevator removeElevator(String key) {
        return elevatorMap.remove(key);
    }

    public List<Elevator> getAllElevators(){
        return new ArrayList<>(elevatorMap.values());
    }


}
