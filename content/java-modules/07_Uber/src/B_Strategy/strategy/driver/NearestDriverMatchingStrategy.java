package B_Strategy.strategy.driver;

import B_Strategy.datastore.DataStore;
import B_Strategy.model.Cab;
import B_Strategy.model.Driver;
import B_Strategy.model.Location;
import B_Strategy.model.enums.VehicleType;

import java.util.ArrayList;
import java.util.List;

public class NearestDriverMatchingStrategy implements DriverMatchingStrategy {
    private final double nearbyDistance;

    public NearestDriverMatchingStrategy(double nearbyDistance) {
        this.nearbyDistance = nearbyDistance;
    }

    @Override
    public List<Driver> findDrivers(Location pickupLocation, VehicleType vehicleType, DataStore dataStore) {
        List<Driver> driverList = new ArrayList<>();
        for (Cab cab : dataStore.getCabList()) {
            if (cab.getVehicleType() == vehicleType
                    && cab.isAvailable()
                    && cab.getCurrentLocation().distanceTo(pickupLocation) <= nearbyDistance) {
                Driver driver = findDriverByCab(cab.getCabId(), dataStore);
                if (driver != null) {
                    driverList.add(driver);
                }
            }
        }
        driverList.sort((left, right) -> Double.compare(
                distanceFromDriverCab(left, pickupLocation, dataStore),
                distanceFromDriverCab(right, pickupLocation, dataStore)
        ));
        return driverList;
    }

    private Driver findDriverByCab(String cabId, DataStore dataStore) {
        for (Driver driver : dataStore.getDriverList()) {
            if (driver.getCabId().equals(cabId)) {
                return driver;
            }
        }
        return null;
    }

    private double distanceFromDriverCab(Driver driver, Location pickupLocation, DataStore dataStore) {
        Cab cab = dataStore.getCab(driver.getCabId());
        return cab.getCurrentLocation().distanceTo(pickupLocation);
    }
}
