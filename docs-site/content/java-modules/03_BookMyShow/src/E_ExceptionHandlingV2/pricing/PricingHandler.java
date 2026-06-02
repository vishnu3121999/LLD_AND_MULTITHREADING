package E_ExceptionHandlingV2.pricing;

public abstract class PricingHandler {
    private PricingHandler nextHandler;

    public PricingHandler linkWith(PricingHandler nextHandler) {
        this.nextHandler = nextHandler;
        return nextHandler;
    }

    public final void handle(PricingContext pricingContext) {
        applyPricing(pricingContext);
        if (nextHandler != null) {
            nextHandler.handle(pricingContext);
        }
    }

    protected abstract void applyPricing(PricingContext pricingContext);
}
