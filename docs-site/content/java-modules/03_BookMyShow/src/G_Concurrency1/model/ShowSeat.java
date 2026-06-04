package G_Concurrency1.model;

import G_Concurrency1.model.enums.SeatStatus;

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

    public void hold() {
        validateCanHold();
        this.seatStatus = SeatStatus.HELD;
    }

    public void book() {
        validateCanBook();
        this.seatStatus = SeatStatus.BOOKED;
    }

    public void releaseHold() {
        if (seatStatus != SeatStatus.HELD) {
            throw new IllegalStateException("Show seat can only release hold from HELD state: " + showSeatId);
        }
        this.seatStatus = SeatStatus.AVAILABLE;
    }

    public void validateCanHold() {
        if (seatStatus != SeatStatus.AVAILABLE) {
            throw new IllegalStateException("Show seat can only be held from AVAILABLE state: " + showSeatId);
        }
    }

    public void validateCanBook() {
        if (seatStatus != SeatStatus.HELD) {
            throw new IllegalStateException("Show seat can only be booked from HELD state: " + showSeatId);
        }
    }

    public void updatePrice(int price) {
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

