package G_Concurrency1.pricing;

public class BasePriceHandler extends PricingHandler {
    @Override
    protected void applyPricing(PricingContext pricingContext) {
        pricingContext.setCurrentPrice(pricingContext.getBasePrice());
    }
}

