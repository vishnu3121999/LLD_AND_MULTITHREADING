package E_OrchestrationValidations.strategy.driver;

import E_OrchestrationValidations.datastore.DataStore;
import E_OrchestrationValidations.model.Driver;
import E_OrchestrationValidations.model.Location;
import E_OrchestrationValidations.model.enums.VehicleType;

import java.util.List;

public interface DriverMatchingStrategy {
    List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore);
}
