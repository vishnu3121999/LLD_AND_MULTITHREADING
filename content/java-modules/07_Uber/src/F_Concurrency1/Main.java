package F_Concurrency1;

import F_Concurrency1.datastore.DataStore;
import F_Concurrency1.datastore.InMemoryDataStore;
import F_Concurrency1.model.Booking;
import F_Concurrency1.model.Driver;
import F_Concurrency1.model.FareEstimate;
import F_Concurrency1.model.Location;
import F_Concurrency1.model.enums.VehicleType;
import F_Concurrency1.observer.ConsoleDriverNotificationObserver;
import F_Concurrency1.observer.WebSocketDriverNotificationObserver;
import F_Concurrency1.service.UberFacade;
import F_Concurrency1.strategy.driver.NearestDriverMatchingStrategy;
import F_Concurrency1.strategy.fare.BaseFareStrategy;
import F_Concurrency1.strategy.fare.SurgeFareStrategy;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) {
        try {
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

            runConcurrentAcceptDemo();
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static void runConcurrentAcceptDemo() {
        DataStore dataStore = new InMemoryDataStore();
        UberFacade uberFacade = new UberFacade(dataStore,
                new NearestDriverMatchingStrategy(5.0),
                new SurgeFareStrategy(new BaseFareStrategy()));

        String riderId = id("rider");
        String firstCabId = id("cab");
        String secondCabId = id("cab");
        String firstDriverId = id("driver");
        String secondDriverId = id("driver");

        uberFacade.addRider(riderId, "Ishaan", new Location(0.0, 0.0));
        uberFacade.addCab(firstCabId, VehicleType.GO, "KA-01-GO-4567", new Location(1.0, 1.0));
        uberFacade.addCab(secondCabId, VehicleType.GO, "KA-01-GO-5678", new Location(1.0, 2.0));
        uberFacade.addDriver(firstDriverId, "Dev", firstCabId);
        uberFacade.addDriver(secondDriverId, "Neel", secondCabId);

        Booking booking = uberFacade.bookRide(riderId, new Location(3.0, 4.0), VehicleType.GO);
        CountDownLatch readyGate = new CountDownLatch(2);
        CountDownLatch startGate = new CountDownLatch(1);
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        try {
            Future<String> firstResult = executorService.submit(acceptTask(
                    uberFacade, booking.getBookingId(), firstDriverId, readyGate, startGate));
            Future<String> secondResult = executorService.submit(acceptTask(
                    uberFacade, booking.getBookingId(), secondDriverId, readyGate, startGate));

            readyGate.await();
            startGate.countDown();

            System.out.println("Concurrent accept demo");
            System.out.println(firstResult.get());
            System.out.println(secondResult.get());
            System.out.println(booking);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent accept demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent accept demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> acceptTask(UberFacade uberFacade, String bookingId, String driverId,
                                               CountDownLatch readyGate, CountDownLatch startGate) {
        return () -> {
            readyGate.countDown();
            startGate.await();
            try {
                uberFacade.acceptRide(bookingId, driverId);
                return driverId + " accepted";
            } catch (RuntimeException exception) {
                return driverId + " failed: " + exception.getMessage();
            }
        };
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
