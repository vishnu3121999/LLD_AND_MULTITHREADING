package F_Concurrency1.strategy.driver;

import F_Concurrency1.datastore.DataStore;
import F_Concurrency1.model.Driver;
import F_Concurrency1.model.Location;
import F_Concurrency1.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
