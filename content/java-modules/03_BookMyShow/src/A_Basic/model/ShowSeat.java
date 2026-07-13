package A_Basic.model;

import A_Basic.model.enums.SeatStatus;

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
        this.seatStatus = SeatStatus.HELD;
    }

    public void book() {
        this.seatStatus = SeatStatus.BOOKED;
    }

    public void releaseHold() {
        this.seatStatus = SeatStatus.AVAILABLE;
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
