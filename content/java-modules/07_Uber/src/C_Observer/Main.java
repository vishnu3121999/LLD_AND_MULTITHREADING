package C_Observer;

import C_Observer.datastore.DataStore;
import C_Observer.datastore.InMemoryDataStore;
import C_Observer.model.Booking;
import C_Observer.model.Driver;
import C_Observer.model.FareEstimate;
import C_Observer.model.Location;
import C_Observer.model.enums.VehicleType;
import C_Observer.observer.ConsoleDriverNotificationObserver;
import C_Observer.observer.WebSocketDriverNotificationObserver;
import C_Observer.service.UberFacade;
import C_Observer.strategy.driver.NearestDriverMatchingStrategy;
import C_Observer.strategy.fare.BaseFareStrategy;
import C_Observer.strategy.fare.SurgeFareStrategy;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        DataStore dataStore = new InMemoryDataStore();
        UberFacade uberFacade = new UberFacade(dataStore,
                new NearestDriverMatchingStrategy(5.0),
                new SurgeFareStrategy(new BaseFareStrategy()));
        uberFacade.addDriverNotificationObserver(new ConsoleDriverNotificationObserver());
        uberFacade.addDriverNotificationObserver(new WebSocketDriverNotificationObserver("/drivers"));

        String riderId = id("rider");
        String sedanCabId = id("cab");
        String goCabId = id("cab");
        String autoCabId = id("cab");
        String sedanDriverId = id("driver");
        String goDriverId = id("driver");
        String autoDriverId = id("driver");

        Location pickupLocation = new Location(0.0, 0.0);
        Location destinationLocation = new Location(3.0, 4.0);

        uberFacade.addRider(riderId, "Aarav", pickupLocation);
        uberFacade.addCab(sedanCabId, VehicleType.SEDAN, "KA-01-SE-1234", new Location(1.0, 1.0));
        uberFacade.addCab(goCabId, VehicleType.GO, "KA-01-GO-2345", new Location(2.0, 1.0));
        uberFacade.addCab(autoCabId, VehicleType.AUTO, "KA-01-AU-3456", new Location(1.0, 2.0));
        uberFacade.addDriver(sedanDriverId, "Meera", sedanCabId);
        uberFacade.addDriver(goDriverId, "Kabir", goCabId);
        uberFacade.addDriver(autoDriverId, "Rohan", autoCabId);

        System.out.println("Fare estimates");
        List<FareEstimate> fareEstimateList = uberFacade.showFareEstimates(pickupLocation, destinationLocation);
        for (FareEstimate fareEstimate : fareEstimateList) {
            System.out.println(fareEstimate);
        }

        Booking booking = uberFacade.bookRide(riderId, destinationLocation, VehicleType.GO);
        System.out.println("Booking created");
        System.out.println(booking);

        Driver acceptingDriver = dataStore.getDriver(goDriverId);
        uberFacade.acceptRide(booking.getBookingId(), acceptingDriver.getDriverId());
        System.out.println("Driver accepted");
        System.out.println(booking);

        boolean rideStarted = uberFacade.startRide(booking.getBookingId(), acceptingDriver.getDriverId(), booking.getOtp());
        System.out.println("Ride started: " + rideStarted);
        System.out.println(booking);

        uberFacade.endRide(booking.getBookingId(), acceptingDriver.getDriverId());
        System.out.println("Ride completed");
        System.out.println(booking);
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
