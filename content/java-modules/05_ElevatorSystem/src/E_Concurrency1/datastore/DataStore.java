package E_Concurrency1.datastore;

import E_Concurrency1.model.Building;
import E_Concurrency1.model.Display;
import E_Concurrency1.model.Elevator;

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
