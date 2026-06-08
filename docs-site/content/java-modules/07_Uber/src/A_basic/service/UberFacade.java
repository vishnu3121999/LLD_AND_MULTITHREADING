package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.City;
import A_basic.model.Driver;
import A_basic.model.Location;
import A_basic.model.Ride;
import A_basic.model.Rider;
import A_basic.model.Vehicle;
import A_basic.model.enums.DriverStatus;
import A_basic.model.enums.VehicleType;

public class UberFacade {
    private final DataStore dataStore;
    public UberFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public String requestRide(String rideId, String cityId, String riderId, Location pickupLocation, Location dropLocation) {
        Driver driver = findNearestDriver(cityId, pickupLocation);
        driver.assignRide();
        Ride ride = new Ride(rideId, riderId, driver.getDriverId(), pickupLocation, dropLocation, calculateFare(pickupLocation, dropLocation));
        dataStore.putRide(ride.getRideId(), ride);
        return rideId;
    }

    public Ride completeRide(String rideId) {
        Ride ride = dataStore.getRide(rideId);
        Driver driver = dataStore.getDriver(ride.getDriverId());
        ride.complete();
        driver.completeRide(ride.getDropLocation());
        return ride;
    }

    // System methods

    public Driver findNearestDriver(String cityId, Location pickupLocation) {
        City city = dataStore.getCity(cityId);
        Driver nearestDriver = dataStore.getDriver(city.getDriverList().get(0));
        double bestDistance = nearestDriver.getCurrentLocation().distanceTo(pickupLocation);
        for (String driverId : city.getDriverList()) {
            Driver driver = dataStore.getDriver(driverId);
            if (driver.getDriverStatus() == DriverStatus.AVAILABLE) {
                double distance = driver.getCurrentLocation().distanceTo(pickupLocation);
                if (distance <= bestDistance) { nearestDriver = driver; bestDistance = distance; }
            }
        }
        return nearestDriver;
    }

    // Admin methods

    public void addCity(String cityId, String name) {
        City city = new City(cityId, name);
        dataStore.putCity(city.getCityId(), city);
    }

    public void addRider(String cityId, String riderId, String name) {
        Rider rider = new Rider(riderId, name);
        dataStore.putRider(rider.getRiderId(), rider);
        dataStore.getCity(cityId).addRider(riderId);
    }

    public void addVehicle(String vehicleId, String registrationNumber, VehicleType vehicleType) {
        Vehicle vehicle = new Vehicle(vehicleId, registrationNumber, vehicleType);
        dataStore.putVehicle(vehicle.getVehicleId(), vehicle);
    }

    public void addDriver(String cityId, String driverId, String name, String vehicleId, Location currentLocation) {
        Driver driver = new Driver(driverId, name, vehicleId, currentLocation);
        dataStore.putDriver(driver.getDriverId(), driver);
        dataStore.getCity(cityId).addDriver(driverId);
    }

    // Util/helper methods

    private double calculateFare(Location pickupLocation, Location dropLocation) {
        return pickupLocation.distanceTo(dropLocation) * 15.0;
    }
}
