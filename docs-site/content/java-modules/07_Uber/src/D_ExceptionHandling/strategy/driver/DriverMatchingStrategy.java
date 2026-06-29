package D_ExceptionHandling.strategy.driver;

import D_ExceptionHandling.datastore.DataStore;
import D_ExceptionHandling.model.Driver;
import D_ExceptionHandling.model.Location;
import D_ExceptionHandling.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
