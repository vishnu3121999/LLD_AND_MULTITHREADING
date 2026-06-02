package E_ExceptionHandlingV2;

import E_ExceptionHandlingV2.datastore.DataStore;
import E_ExceptionHandlingV2.datastore.InMemoryDataStore;
import E_ExceptionHandlingV2.model.CreditCardPayment;
import E_ExceptionHandlingV2.model.Payment;
import E_ExceptionHandlingV2.model.Show;
import E_ExceptionHandlingV2.model.ShowSeat;
import E_ExceptionHandlingV2.model.Ticket;
import E_ExceptionHandlingV2.model.enums.SeatType;
import E_ExceptionHandlingV2.payment.PaymentProcessor;
import E_ExceptionHandlingV2.payment.PaymentStrategyFactory;
import E_ExceptionHandlingV2.service.BookMyShowFacade;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
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
        String ticketId = facade.selectSeats(
                "user-1",
                avatarPvrShowId,
                List.of(seatsToBook.get(0).getShowSeatId(), seatsToBook.get(1).getShowSeatId())
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
