package A_basic.datastore;

import A_basic.model.Building;
import A_basic.model.Display;
import A_basic.model.Elevator;

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
