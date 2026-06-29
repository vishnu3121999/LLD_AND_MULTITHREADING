package D_ExceptionHandlingV2.strategy.driver;

import D_ExceptionHandlingV2.datastore.DataStore;
import D_ExceptionHandlingV2.model.Driver;
import D_ExceptionHandlingV2.model.Location;
import D_ExceptionHandlingV2.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
