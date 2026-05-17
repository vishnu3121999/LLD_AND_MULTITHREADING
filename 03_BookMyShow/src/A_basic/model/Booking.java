package A_basic.model;

import A_basic.model.enums.BookingStatus;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Booking {
    private final String bookingId;
    private final User user;
    private final Show show;
    private final List<ShowSeat> showSeats;
    private final double totalAmount;
    private BookingStatus status;

    public Booking(
            String bookingId,
            User user,
            Show show,
            List<ShowSeat> showSeats,
            double totalAmount,
            BookingStatus status
    ) {
        this.bookingId = bookingId;
        this.user = user;
        this.show = show;
        this.showSeats = Collections.unmodifiableList(new ArrayList<>(showSeats));
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public String getBookingId() {
        return bookingId;
    }

    public User getUser() {
        return user;
    }

    public Show getShow() {
        return show;
    }

    public List<ShowSeat> getShowSeats() {
        return showSeats;
    }

    public List<String> getSeatIds() {
        List<String> seatIds = new ArrayList<>();
        for (ShowSeat showSeat : showSeats) {
            seatIds.add(showSeat.getSeat().getSeatId());
        }
        return seatIds;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void markCancelled() {
        status = BookingStatus.CANCELLED;
    }

    @Override
    public String toString() {
        return "Booking{id='" + bookingId + "', movie='" + show.getMovie().getTitle() + "', user='" + user.getName()
                + "', seats=" + getSeatIds() + ", amount=" + String.format("%.2f", totalAmount)
                + ", status=" + status + "}";
    }
}
