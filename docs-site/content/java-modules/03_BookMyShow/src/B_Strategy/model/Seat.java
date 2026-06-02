package B_Strategy.model;

import B_Strategy.model.enums.SeatType;

public class Seat {
    private final String seatId;
    private final SeatType seatType;

    public Seat(String seatId, SeatType seatType) {
        this.seatId = seatId;
        this.seatType = seatType;
    }

    @Override
    public String toString() {
        return "Seat{" +
                "seatId='" + seatId + '\'' +
                ", type=" + seatType +
                '}';
    }

    public String getSeatId() {
        return seatId;
    }

    public SeatType getSeatType() {
        return seatType;
    }
}
