package B_Strategy.strategy.driver;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Driver;
import B_Strategy.model.Location;
import B_Strategy.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
