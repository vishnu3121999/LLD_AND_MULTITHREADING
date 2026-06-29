package C_Observer.strategy.driver;

import C_Observer.datastore.DataStore;
import C_Observer.model.Driver;
import C_Observer.model.Location;
import C_Observer.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
