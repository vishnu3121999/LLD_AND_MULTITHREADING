package F_Concurrency.pricing;

public class TaxHandler extends PricingHandler {
    private static final double TAX_RATE = 0.18;

    @Override
    protected void applyPricing(PricingContext pricingContext) {
        double currentPrice = pricingContext.getCurrentPrice();
        pricingContext.setCurrentPrice(currentPrice + currentPrice * TAX_RATE);
    }
}
