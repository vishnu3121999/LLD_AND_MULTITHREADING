package G_Concurrency1;

import G_Concurrency1.datastore.DataStore;
import G_Concurrency1.datastore.InMemoryDataStore;
import G_Concurrency1.model.CreditCardPayment;
import G_Concurrency1.model.Payment;
import G_Concurrency1.model.Show;
import G_Concurrency1.model.ShowSeat;
import G_Concurrency1.model.Ticket;
import G_Concurrency1.model.enums.SeatType;
import G_Concurrency1.payment.PaymentProcessor;
import G_Concurrency1.payment.PaymentStrategyFactory;
import G_Concurrency1.service.BookMyShowFacade;

import java.time.LocalDateTime;
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
            PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory());
            BookMyShowFacade facade = new BookMyShowFacade(dataStore, paymentProcessor);

            runConcurrentAdminDuplicateDemo(facade);

            String hydCityId = id("city");
            String blrCityId = id("city");
            String avatarMovieId = id("movie");
            String rrrMovieId = id("movie");
            String pvrTheaterId = id("theater");
            String inoxTheaterId = id("theater");
            String orionTheaterId = id("theater");
            String pvrScreenId = id("screen");
            String inoxScreenId = id("screen");
            String avatarPvrShowId = id("show");
            String avatarInoxShowId = id("show");
            String rrrPvrShowId = id("show");

            facade.addCity(hydCityId, "HYD");
            facade.addCity(blrCityId, "BLR");

            facade.addMovie(avatarMovieId, "Avatar");
            facade.addMovie(rrrMovieId, "RRR");

            facade.addTheater(hydCityId, pvrTheaterId, "PVR Forum");
            facade.addTheater(hydCityId, inoxTheaterId, "INOX GVK");
            facade.addTheater(blrCityId, orionTheaterId, "PVR Orion");

            facade.addScreen(pvrTheaterId, pvrScreenId, "Screen-1");
            facade.addScreen(inoxTheaterId, inoxScreenId, "Audi-1");

            addPvrLayout(facade, pvrScreenId);
            addInoxLayout(facade, inoxScreenId);

            facade.addShow(
                    avatarPvrShowId,
                    avatarMovieId,
                    pvrScreenId,
                    LocalDateTime.of(2026, 6, 1, 18, 0),
                    250
            );
            facade.addShow(
                    avatarInoxShowId,
                    avatarMovieId,
                    inoxScreenId,
                    LocalDateTime.of(2026, 6, 1, 21, 0),
                    220
            );
            facade.addShow(
                    rrrPvrShowId,
                    rrrMovieId,
                    pvrScreenId,
                    LocalDateTime.of(2026, 6, 2, 12, 0),
                    200
            );

            System.out.println("Shows for Avatar in HYD");
            for (Show show : facade.searchShows("Avatar", hydCityId)) {
                System.out.println(show);
            }
            System.out.println();

            printSeats("Seats before selection", facade.getSeatsForShow(avatarPvrShowId));

            List<ShowSeat> seatsToBook = facade.getSeatsForShow(avatarPvrShowId);
            String ticketId = runConcurrentSelectionDemo(
                    facade,
                    avatarPvrShowId,
                    seatsToBook.get(0).getShowSeatId()
            );
            Ticket selectedTicket = facade.getTicket(ticketId);
            System.out.println("Ticket after selecting seats: " + selectedTicket);
            printSeats("Seats after selection", facade.getSeatsForShow(avatarPvrShowId));

            Payment payment = new CreditCardPayment(
                    selectedTicket.getPrice(),
                    "4111111111111111",
                    "123"
            );
            Ticket paidTicket = facade.pay(ticketId, payment);
            System.out.println("Ticket after payment: " + paidTicket);
            printSeats("Seats after payment", facade.getSeatsForShow(avatarPvrShowId));
        } catch (RuntimeException exception) {
            System.out.println("Demo failed: " + exception.getMessage());
        }
    }

    private static void runConcurrentAdminDuplicateDemo(BookMyShowFacade facade) {
        System.out.println("Two admins try to add the same city concurrently");
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Future<String> adminOne = executorService.submit(addCity(facade, "admin-1", "city-admin-demo", ready, start));
        Future<String> adminTwo = executorService.submit(addCity(facade, "admin-2", "city-admin-demo", ready, start));

        try {
            ready.await();
            start.countDown();
            adminOne.get();
            adminTwo.get();
            System.out.println();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent admin demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent admin demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> addCity(BookMyShowFacade facade, String adminId, String cityId,
                                            CountDownLatch ready, CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            try {
                facade.addCity(cityId, "ADMIN-DEMO");
                System.out.println(adminId + " added city: " + cityId);
            } catch (RuntimeException exception) {
                System.out.println(adminId + " failed to add city: " + exception.getMessage());
            }
            return cityId;
        };
    }

    private static String runConcurrentSelectionDemo(BookMyShowFacade facade, String showId, String showSeatId) {
        System.out.println("Two users try to hold the same seat concurrently");
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Future<String> userOne = executorService.submit(selectSeat(facade, "user-1", showId, showSeatId, ready, start));
        Future<String> userTwo = executorService.submit(selectSeat(facade, "user-2", showId, showSeatId, ready, start));

        try {
            ready.await();
            start.countDown();
            String firstTicketId = userOne.get();
            String secondTicketId = userTwo.get();
            String ticketId = firstTicketId != null ? firstTicketId : secondTicketId;
            if (ticketId == null) {
                throw new RuntimeException("No user could hold the seat");
            }
            System.out.println();
            return ticketId;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Concurrent selection demo interrupted", exception);
        } catch (ExecutionException exception) {
            throw new RuntimeException("Concurrent selection demo failed", exception);
        } finally {
            executorService.shutdown();
        }
    }

    private static Callable<String> selectSeat(BookMyShowFacade facade, String userId, String showId, String showSeatId,
                                               CountDownLatch ready, CountDownLatch start) {
        return () -> {
            ready.countDown();
            start.await();
            try {
                String ticketId = facade.selectSeats(userId, showId, List.of(showSeatId));
                System.out.println(userId + " held the seat with ticket: " + ticketId);
                return ticketId;
            } catch (RuntimeException exception) {
                System.out.println(userId + " failed to hold the seat: " + exception.getMessage());
                return null;
            }
        };
    }

    private static void addPvrLayout(BookMyShowFacade facade, String screenId) {
        facade.addSeat(screenId, id("seat"), SeatType.NORMAL);
        facade.addSeat(screenId, id("seat"), SeatType.NORMAL);
        facade.addSeat(screenId, id("seat"), SeatType.PREMIUM);
        facade.addSeat(screenId, id("seat"), SeatType.RECLINER);
    }

    private static void addInoxLayout(BookMyShowFacade facade, String screenId) {
        facade.addSeat(screenId, id("seat"), SeatType.NORMAL);
        facade.addSeat(screenId, id("seat"), SeatType.NORMAL);
        facade.addSeat(screenId, id("seat"), SeatType.NORMAL);
        facade.addSeat(screenId, id("seat"), SeatType.PREMIUM);
        facade.addSeat(screenId, id("seat"), SeatType.RECLINER);
    }

    private static void printSeats(String label, List<ShowSeat> seats) {
        System.out.println(label);
        for (ShowSeat seat : seats) {
            System.out.println(seat);
        }
        System.out.println();
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}

