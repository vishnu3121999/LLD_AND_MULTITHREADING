package G_Concurrency2;

import G_Concurrency2.datastore.DataStore;
import G_Concurrency2.datastore.InMemoryDataStore;
import G_Concurrency2.model.Booking;
import G_Concurrency2.model.Driver;
import G_Concurrency2.model.FareEstimate;
import G_Concurrency2.model.Location;
import G_Concurrency2.model.enums.VehicleType;
import G_Concurrency2.observer.ConsoleDriverNotificationObserver;
import G_Concurrency2.observer.WebSocketDriverNotificationObserver;
import G_Concurrency2.service.UberFacade;
import G_Concurrency2.strategy.driver.NearestDriverMatchingStrategy;
import G_Concurrency2.strategy.fare.BaseFareStrategy;
import G_Concurrency2.strategy.fare.SurgeFareStrategy;

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

            runStartVsCancelDemo();
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static void runStartVsCancelDemo() {
        DataStore dataStore = new InMemoryDataStore();
        UberFacade uberFacade = new UberFacade(dataStore,
                new NearestDriverMatchingStrategy(5.0),
                new SurgeFareStrategy(new BaseFareStrategy()));

        String riderId = id("rider");
        String cabId = id("cab");
        String driverId = id("driver");

        uberFacade.addRider(riderId, "Tara", new Location(0.0, 0.0));
        uberFacade.addCab(cabId, VehicleType.GO, "KA-01-GO-6789", new Location(1.0, 1.0));
        uberFacade.addDriver(driverId, "Vihaan", cabId);

        Booking booking = uberFacade.bookRide(riderId, new Location(3.0, 4.0), VehicleType.GO);
        uberFacade.acceptRide(booking.getBookingId(), driverId);

        CountDownLatch readyGate = new CountDownLatch(2);
        CountDownLatch startGate = new CountDownLatch(1);
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        try {
            Future<String> startResult = executorService.submit(startTask(
                    uberFacade, booking.getBookingId(), driverId, booking.getOtp(), readyGate, startGate));
            Future<String> cancelResult = executorService.submit(cancelTask(
                    uberFacade, booking.getBookingId(), readyGate, startGate));

            readyGate.await();
            startGate.countDown();

            System.out.println("Concurrent start/cancel demo");
            System.out.println(startResult.get());
            System.out.println(cancelResult.get());
            System.out.println(booking);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent start/cancel demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent start/cancel demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> startTask(UberFacade uberFacade, String bookingId, String driverId, String otp,
                                              CountDownLatch readyGate, CountDownLatch startGate) {
        return () -> {
            readyGate.countDown();
            startGate.await();
            try {
                boolean started = uberFacade.startRide(bookingId, driverId, otp);
                return "startRide returned " + started;
            } catch (RuntimeException exception) {
                return "startRide failed: " + exception.getMessage();
            }
        };
    }

    private static Callable<String> cancelTask(UberFacade uberFacade, String bookingId,
                                               CountDownLatch readyGate, CountDownLatch startGate) {
        return () -> {
            readyGate.countDown();
            startGate.await();
            try {
                uberFacade.cancel(bookingId);
                return "cancel completed";
            } catch (RuntimeException exception) {
                return "cancel failed: " + exception.getMessage();
            }
        };
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
