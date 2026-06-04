package G_Concurrency1.pricing;

import G_Concurrency1.model.enums.SeatType;

public class SeatTypeHandler extends PricingHandler {
    private static final double PREMIUM_MULTIPLIER = 1.2;
    private static final double RECLINER_MULTIPLIER = 1.5;

    @Override
    protected void applyPricing(PricingContext pricingContext) {
        double currentPrice = pricingContext.getCurrentPrice();
        SeatType seatType = pricingContext.getSeatType();
        if (seatType == SeatType.RECLINER) {
            pricingContext.setCurrentPrice(currentPrice * RECLINER_MULTIPLIER);
            return;
        }
        if (seatType == SeatType.PREMIUM) {
            pricingContext.setCurrentPrice(currentPrice * PREMIUM_MULTIPLIER);
        }
    }
}

