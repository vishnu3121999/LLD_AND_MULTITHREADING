package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.model.Location;
import A_basic.model.enums.VehicleType;
import A_basic.service.UberFacade;

import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== Uber Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        UberFacade facade = new UberFacade(dataStore);

        String cityId = id("city");
        String riderId = id("rider");
        String driverOneId = id("driver");
        String driverTwoId = id("driver");
        String vehicleOneId = id("vehicle");
        String vehicleTwoId = id("vehicle");
        String rideId = id("ride");

        facade.addCity(cityId, "Bengaluru");
        facade.addRider(cityId, riderId, "Riya");
        facade.addVehicle(vehicleOneId, "KA-01-UB-1001", VehicleType.SEDAN);
        facade.addVehicle(vehicleTwoId, "KA-01-UB-2002", VehicleType.SUV);
        facade.addDriver(cityId, driverOneId, "Driver One", vehicleOneId, new Location(12.9, 77.5));
        facade.addDriver(cityId, driverTwoId, "Driver Two", vehicleTwoId, new Location(12.95, 77.6));

        facade.requestRide(rideId, cityId, riderId, new Location(12.91, 77.51), new Location(13.0, 77.7));
        System.out.println(dataStore.getRide(rideId));
        System.out.println(facade.completeRide(rideId));
        System.out.println(dataStore.getDriver(dataStore.getRide(rideId).getDriverId()));
    }

    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
