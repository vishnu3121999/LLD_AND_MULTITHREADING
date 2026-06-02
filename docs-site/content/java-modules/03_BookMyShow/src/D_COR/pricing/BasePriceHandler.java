package D_COR.pricing;

public class BasePriceHandler extends PricingHandler {
    @Override
    protected void applyPricing(PricingContext pricingContext) {
        pricingContext.setCurrentPrice(pricingContext.getBasePrice());
    }
}
