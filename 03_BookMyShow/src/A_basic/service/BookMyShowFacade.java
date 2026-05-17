package A_basic.service;

import A_basic.model.Booking;
import A_basic.model.Show;
import A_basic.model.ShowSeat;
import A_basic.model.User;

import java.util.ArrayList;
import java.util.List;

public class BookMyShowFacade {
    private final BookingService bookingService;

    public BookMyShowFacade(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    public Booking bookSeats(User user, Show show, List<String> seatIds) {
        return bookingService.createBooking(user, show, seatIds);
    }

    public boolean cancelBooking(String bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    public List<String> getAvailableSeatLabels(Show show) {
        List<String> seatLabels = new ArrayList<>();
        for (ShowSeat showSeat : bookingService.getAvailableSeats(show)) {
            seatLabels.add(showSeat.getSeat().getDisplayLabel());
        }
        return seatLabels;
    }
}
