package A_Basic.pricing;

import A_Basic.datastore.DataStore;
import A_Basic.model.Seat;
import A_Basic.model.Show;
import A_Basic.model.ShowSeat;
import A_Basic.model.Ticket;
import A_Basic.model.enums.SeatType;

import java.time.LocalDateTime;

public class PriceCalculator {
    private static final double PREMIUM_MULTIPLIER = 1.2;
    private static final double RECLINER_MULTIPLIER = 1.5;
    private static final double EVENING_MULTIPLIER = 1.1;
    private static final double MORNING_DISCOUNT_MULTIPLIER = 0.9;
    private static final double TAX_RATE = 0.18;

    private final DataStore dataStore;

    public PriceCalculator(DataStore dataStore) {
        this.dataStore = dataStore;
    }

    public int calculateShowSeatPrice(int basePrice, SeatType seatType, LocalDateTime startTime) {
        double price = basePrice;
        price = applySeatTypePrice(price, seatType);
        price = applyTimeOfDayPrice(price, startTime);
        return (int) Math.round(price);
    }

    public int calculateTicketPrice(Ticket ticket) {
        Show show = dataStore.getShow(ticket.getShowId());
        int selectedSeatTotal = 0;
        for (String showSeatId : ticket.getShowSeatList()) {
            ShowSeat showSeat = dataStore.getShowSeat(showSeatId);
            Seat seat = dataStore.getSeat(showSeat.getSeatId());
            int showSeatPrice = calculateShowSeatPrice(showSeat.getBasePrice(), seat.getSeatType(), show.getStartTime());
            showSeat.updatePrice(showSeatPrice);
            selectedSeatTotal += showSeatPrice;
        }

        int ticketPrice = applyTicketAdjustments(selectedSeatTotal, show.getStartTime());
        ticket.updatePrice(ticketPrice);
        return ticketPrice;
    }

    private int applyTicketAdjustments(int selectedSeatTotal, LocalDateTime startTime) {
        double price = selectedSeatTotal;
        price = applyDiscount(price, startTime);
        price = applyTax(price);
        return (int) Math.round(price);
    }

    private double applySeatTypePrice(double currentPrice, SeatType seatType) {
        if (seatType == SeatType.RECLINER) {
            return currentPrice * RECLINER_MULTIPLIER;
        }
        if (seatType == SeatType.PREMIUM) {
            return currentPrice * PREMIUM_MULTIPLIER;
        }
        return currentPrice;
    }

    private double applyTimeOfDayPrice(double currentPrice, LocalDateTime startTime) {
        if (startTime.getHour() >= 18) {
            return currentPrice * EVENING_MULTIPLIER;
        }
        return currentPrice;
    }

    private double applyDiscount(double currentPrice, LocalDateTime startTime) {
        if (startTime.getHour() < 12) {
            return currentPrice * MORNING_DISCOUNT_MULTIPLIER;
        }
        return currentPrice;
    }

    private double applyTax(double currentPrice) {
        return currentPrice + currentPrice * TAX_RATE;
    }
}
