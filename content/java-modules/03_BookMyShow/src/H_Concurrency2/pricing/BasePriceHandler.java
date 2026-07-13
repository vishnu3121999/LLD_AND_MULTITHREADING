package H_Concurrency2.pricing;

public class BasePriceHandler extends PricingHandler {
    @Override
    protected void applyPricing(PricingContext pricingContext) {
        pricingContext.setCurrentPrice(pricingContext.getBasePrice());
    }
}

