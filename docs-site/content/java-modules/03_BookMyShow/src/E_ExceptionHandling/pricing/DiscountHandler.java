package E_ExceptionHandling.pricing;

public class DiscountHandler extends PricingHandler {
    private static final double MORNING_DISCOUNT_MULTIPLIER = 0.9;

    @Override
    protected void applyPricing(PricingContext pricingContext) {
        if (pricingContext.getStartTime().getHour() < 12) {
            pricingContext.setCurrentPrice(pricingContext.getCurrentPrice() * MORNING_DISCOUNT_MULTIPLIER);
        }
    }
}
