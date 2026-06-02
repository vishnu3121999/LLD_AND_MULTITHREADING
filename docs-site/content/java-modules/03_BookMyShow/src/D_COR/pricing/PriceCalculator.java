package D_COR.pricing;

import D_COR.datastore.DataStore;
import D_COR.model.Seat;
import D_COR.model.Show;
import D_COR.model.ShowSeat;
import D_COR.model.Ticket;
import D_COR.model.enums.SeatType;

import java.time.LocalDateTime;

public class PriceCalculator {
    private final DataStore dataStore;
    private final PricingHandler showSeatPricingChain;
    private final PricingHandler ticketPricingChain;

    public PriceCalculator(DataStore dataStore) {
        this.dataStore = dataStore;
        this.showSeatPricingChain = buildShowSeatPricingChain();
        this.ticketPricingChain = buildTicketPricingChain();
    }

    public int calculateShowSeatPrice(int basePrice, SeatType seatType, LocalDateTime startTime) {
        PricingContext pricingContext = new PricingContext(basePrice, seatType, startTime);
        showSeatPricingChain.handle(pricingContext);
        return pricingContext.roundedPrice();
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
        PricingContext pricingContext = new PricingContext(selectedSeatTotal, null, startTime);
        ticketPricingChain.handle(pricingContext);
        return pricingContext.roundedPrice();
    }

    private PricingHandler buildShowSeatPricingChain() {
        PricingHandler basePriceHandler = new BasePriceHandler();
        basePriceHandler
                .linkWith(new SeatTypeHandler())
                .linkWith(new TimeOfDayHandler());
        return basePriceHandler;
    }

    private PricingHandler buildTicketPricingChain() {
        PricingHandler discountHandler = new DiscountHandler();
        discountHandler.linkWith(new TaxHandler());
        return discountHandler;
    }
}
