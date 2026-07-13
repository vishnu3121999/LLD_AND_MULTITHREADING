package E_ExceptionHandlingV2.pricing;

public class BasePriceHandler extends PricingHandler {
    @Override
    protected void applyPricing(PricingContext pricingContext) {
        pricingContext.setCurrentPrice(pricingContext.getBasePrice());
    }
}
