package F_Concurrency;

import F_Concurrency.datastore.DataStore;
import F_Concurrency.datastore.InMemoryDataStore;
import F_Concurrency.model.CreditCardPayment;
import F_Concurrency.model.Payment;
import F_Concurrency.model.Show;
import F_Concurrency.model.ShowSeat;
import F_Concurrency.model.Ticket;
import F_Concurrency.model.enums.SeatType;
import F_Concurrency.payment.PaymentProcessor;
import F_Concurrency.payment.PaymentStrategyFactory;
import F_Concurrency.service.BookMyShowFacade;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        DataStore dataStore = new InMemoryDataStore();
        PaymentProcessor paymentProcessor = new PaymentProcessor(new PaymentStrategyFactory());
        BookMyShowFacade facade = new BookMyShowFacade(dataStore, paymentProcessor);

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
        List<String> selectedShowSeatList = List.of(
                seatsToBook.get(0).getShowSeatId(),
                seatsToBook.get(1).getShowSeatId()
        );
        AtomicReference<String> user1TicketId = new AtomicReference<>();
        AtomicReference<String> user2TicketId = new AtomicReference<>();
        AtomicReference<RuntimeException> user1Error = new AtomicReference<>();
        AtomicReference<RuntimeException> user2Error = new AtomicReference<>();

        Thread user1Thread = new Thread(
                () -> selectSeats(facade, "user-1", avatarPvrShowId, selectedShowSeatList, user1TicketId, user1Error)
        );
        Thread user2Thread = new Thread(
                () -> selectSeats(facade, "user-2", avatarPvrShowId, selectedShowSeatList, user2TicketId, user2Error)
        );

        user1Thread.start();
        user2Thread.start();
        user1Thread.join();
        user2Thread.join();

        printSelectionResult("user-1", user1TicketId.get(), user1Error.get());
        printSelectionResult("user-2", user2TicketId.get(), user2Error.get());

        String ticketId = user1TicketId.get() != null ? user1TicketId.get() : user2TicketId.get();
        if (ticketId == null) {
            throw new IllegalStateException("No concurrent seat selection succeeded");
        }

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

    private static void selectSeats(BookMyShowFacade facade, String userId, String showId, List<String> showSeatList,
                                    AtomicReference<String> ticketId, AtomicReference<RuntimeException> error) {
        try {
            ticketId.set(facade.selectSeats(userId, showId, showSeatList));
        } catch (RuntimeException exception) {
            error.set(exception);
        }
    }

    private static void printSelectionResult(String userId, String ticketId, RuntimeException error) {
        if (ticketId != null) {
            System.out.println(userId + " selected seats with ticket: " + ticketId);
            return;
        }
        if (error != null) {
            System.out.println(userId + " could not select seats: " + error.getMessage());
        }
    }

    private static String id(String prefix) {
        return prefix + "-" + UUID.randomUUID();
    }
}
