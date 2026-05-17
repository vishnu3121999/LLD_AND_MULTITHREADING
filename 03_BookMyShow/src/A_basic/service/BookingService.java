package A_basic.service;

import A_basic.model.Booking;
import A_basic.model.Show;
import A_basic.model.ShowSeat;
import A_basic.model.User;
import A_basic.model.enums.BookingStatus;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class BookingService {
    private final Map<String, Booking> bookings;
    private int bookingCounter;

    public BookingService() {
        this.bookings = new LinkedHashMap<>();
        this.bookingCounter = 1;
    }

    public Booking createBooking(User user, Show show, List<String> seatIds) {
        if (user == null || show == null || seatIds == null || seatIds.isEmpty()) {
            return null;
        }

        List<ShowSeat> selectedSeats = new ArrayList<>();
        for (String seatId : seatIds) {
            ShowSeat showSeat = show.getShowSeat(seatId);
            if (showSeat == null || !showSeat.isAvailable()) {
                return null;
            }
            selectedSeats.add(showSeat);
        }

        for (ShowSeat selectedSeat : selectedSeats) {
            if (!selectedSeat.reserve()) {
                rollbackReservation(selectedSeats);
                return null;
            }
        }

        double totalAmount = 0;
        for (ShowSeat selectedSeat : selectedSeats) {
            totalAmount += selectedSeat.getPrice();
        }

        Booking booking = new Booking(nextBookingId(show), user, show, selectedSeats, totalAmount, BookingStatus.CONFIRMED);
        bookings.put(booking.getBookingId(), booking);
        return booking;
    }

    public boolean cancelBooking(String bookingId) {
        Booking booking = bookings.get(bookingId);
        if (booking == null || booking.getStatus() == BookingStatus.CANCELLED) {
            return false;
        }

        for (ShowSeat showSeat : booking.getShowSeats()) {
            showSeat.release();
        }
        booking.markCancelled();
        return true;
    }

    public List<ShowSeat> getAvailableSeats(Show show) {
        return show.getAvailableShowSeats();
    }

    private String nextBookingId(Show show) {
        return show.getShowId() + "-B" + bookingCounter++;
    }

    private void rollbackReservation(List<ShowSeat> selectedSeats) {
        for (ShowSeat showSeat : selectedSeats) {
            if (!showSeat.isAvailable()) {
                showSeat.release();
            }
        }
    }
}
