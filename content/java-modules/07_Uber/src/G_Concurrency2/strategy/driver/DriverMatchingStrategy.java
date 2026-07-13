package G_Concurrency2.strategy.driver;

import G_Concurrency2.datastore.DataStore;
import G_Concurrency2.model.Driver;
import G_Concurrency2.model.Location;
import G_Concurrency2.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
