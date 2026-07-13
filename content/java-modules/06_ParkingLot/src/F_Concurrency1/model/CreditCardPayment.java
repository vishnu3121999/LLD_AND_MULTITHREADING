package F_Concurrency1.model;

public class CreditCardPayment extends Payment {
    private final String cardNo;
    private final String cvv;

    public CreditCardPayment(double amount, String cardNo, String cvv) {
        super(amount);
        this.cardNo = cardNo;
        this.cvv = cvv;
    }

    public String getCardNo() { return cardNo; }
    public String getCvv() { return cvv; }
}




