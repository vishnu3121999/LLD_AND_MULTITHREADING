package A_basic.model;

import A_basic.model.enums.SeatType;

public class Seat {
    private final String seatId;
    private final String rowLabel;
    private final int seatNumber;
    private final SeatType seatType;

    public Seat(String seatId, String rowLabel, int seatNumber, SeatType seatType) {
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
    }

    public String getSeatId() {
        return seatId;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public int getSeatNumber() {
        return seatNumber;
    }

    public String getDisplayLabel() {
        return rowLabel + seatNumber;
    }

    public SeatType getSeatType() {
        return seatType;
    }
}
