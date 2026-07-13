package B_Strategy.datastore;

import B_Strategy.model.Building;
import B_Strategy.model.Display;
import B_Strategy.model.Elevator;

public interface DataStore {
    Building getBuilding(String key);

    void putBuilding(String key, Building value);

    boolean containsBuilding(String key);

    Building removeBuilding(String key);

    Elevator getElevator(String key);

    void putElevator(String key, Elevator value);

    boolean containsElevator(String key);

    Elevator removeElevator(String key);

    Display getDisplay(String key);

    void putDisplay(String key, Display value);

    boolean containsDisplay(String key);

    Display removeDisplay(String key);
}
