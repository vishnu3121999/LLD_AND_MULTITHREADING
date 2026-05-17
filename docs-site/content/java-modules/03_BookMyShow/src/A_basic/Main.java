package A_basic;

import A_basic.model.Booking;
import A_basic.model.Movie;
import A_basic.model.Screen;
import A_basic.model.Seat;
import A_basic.model.Show;
import A_basic.model.Theatre;
import A_basic.model.User;
import A_basic.model.enums.SeatType;
import A_basic.service.BookMyShowFacade;
import A_basic.service.BookingService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Theatre theatre = buildTheatre();
        Movie movie = new Movie("M1", "Interstellar", "English", 169);
        Show eveningShow = buildShow(theatre, movie);

        BookingService bookingService = new BookingService();
        BookMyShowFacade facade = new BookMyShowFacade(bookingService);

        User aman = new User("U1", "Aman");
        User neha = new User("U2", "Neha");

        printAvailability("Initial seats", facade, eveningShow);

        Booking amanBooking = facade.bookSeats(aman, eveningShow, Arrays.asList("A1", "A2"));
        System.out.println("Aman booking -> " + amanBooking);
        printAvailability("After Aman", facade, eveningShow);

        Booking failedBooking = facade.bookSeats(neha, eveningShow, Arrays.asList("A2"));
        System.out.println("Neha tries already booked A2 -> " + failedBooking);

        Booking nehaBooking = facade.bookSeats(neha, eveningShow, Arrays.asList("B1", "C1"));
        System.out.println("Neha booking -> " + nehaBooking);
        printAvailability("After Neha", facade, eveningShow);

        boolean cancelled = facade.cancelBooking(amanBooking.getBookingId());
        System.out.println("Aman cancels -> " + cancelled);
        printAvailability("After cancellation", facade, eveningShow);
    }

    private static Theatre buildTheatre() {
        List<Seat> seats = Arrays.asList(
                new Seat("A1", "A", 1, SeatType.REGULAR),
                new Seat("A2", "A", 2, SeatType.REGULAR),
                new Seat("A3", "A", 3, SeatType.REGULAR),
                new Seat("B1", "B", 1, SeatType.PREMIUM),
                new Seat("B2", "B", 2, SeatType.PREMIUM),
                new Seat("C1", "C", 1, SeatType.RECLINER)
        );

        Screen screen1 = new Screen("SCR-1", "Audi-1", seats);
        return new Theatre("T1", "PVR Phoenix", "Bangalore", Arrays.asList(screen1));
    }

    private static Show buildShow(Theatre theatre, Movie movie) {
        Screen screen = theatre.getScreens().get(0);
        Map<SeatType, Double> seatPricing = new LinkedHashMap<>();
        seatPricing.put(SeatType.REGULAR, 180.0);
        seatPricing.put(SeatType.PREMIUM, 280.0);
        seatPricing.put(SeatType.RECLINER, 420.0);

        return new Show(
                "SHOW-101",
                movie,
                theatre,
                screen,
                LocalDateTime.of(2026, 5, 17, 19, 30),
                seatPricing
        );
    }

    private static void printAvailability(String label, BookMyShowFacade facade, Show show) {
        System.out.println(label + ": " + facade.getAvailableSeatLabels(show));
    }
}
