package F_Concurrency2.datastore;

import F_Concurrency2.model.Building;
import F_Concurrency2.model.Display;
import F_Concurrency2.model.Elevator;

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
