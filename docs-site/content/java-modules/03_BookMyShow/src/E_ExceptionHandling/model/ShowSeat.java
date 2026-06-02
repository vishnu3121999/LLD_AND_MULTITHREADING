package E_ExceptionHandling.model;

import E_ExceptionHandling.exception.SeatUnavailableException;
import E_ExceptionHandling.model.enums.SeatStatus;

public class ShowSeat {
    private final String showSeatId;
    private final String seatId;
    private final int basePrice;
    private int price;
    private SeatStatus seatStatus;

    public ShowSeat(String showSeatId, String seatId, int basePrice) {
        this.showSeatId = showSeatId;
        this.seatId = seatId;
        this.basePrice = basePrice;
        this.price = basePrice;
        this.seatStatus = SeatStatus.AVAILABLE;
    }

    public void ensureAvailable() {
        if (seatStatus != SeatStatus.AVAILABLE) {
            throw new SeatUnavailableException("Seat is not available: " + showSeatId);
        }
    }

    public void hold() {
        ensureAvailable();
        this.seatStatus = SeatStatus.HELD;
    }

    public void book() {
        if (seatStatus != SeatStatus.HELD) {
            throw new SeatUnavailableException("Seat is not held: " + showSeatId);
        }
        this.seatStatus = SeatStatus.BOOKED;
    }

    public void releaseHold() {
        if (seatStatus == SeatStatus.BOOKED) {
            throw new IllegalStateException("Booked seat cannot be released: " + showSeatId);
        }
        this.seatStatus = SeatStatus.AVAILABLE;
    }

    public void updatePrice(int price) {
        if (price < 0) {
            throw new IllegalArgumentException("price cannot be negative");
        }
        this.price = price;
    }

    @Override
    public String toString() {
        return "ShowSeat{" +
                "seatId='" + seatId + '\'' +
                ", status=" + seatStatus +
                ", price=" + price +
                '}';
    }

    public String getShowSeatId() {
        return showSeatId;
    }

    public String getSeatId() {
        return seatId;
    }

    public int getPrice() {
        return price;
    }

    public int getBasePrice() {
        return basePrice;
    }

    public SeatStatus getSeatStatus() {
        return seatStatus;
    }
}
