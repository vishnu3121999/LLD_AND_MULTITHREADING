package F_OrchestrationValidation.pricing;

public class TimeOfDayHandler extends PricingHandler {
    private static final double EVENING_MULTIPLIER = 1.1;

    @Override
    protected void applyPricing(PricingContext pricingContext) {
        if (pricingContext.getStartTime().getHour() >= 18) {
            pricingContext.setCurrentPrice(pricingContext.getCurrentPrice() * EVENING_MULTIPLIER);
        }
    }
}

