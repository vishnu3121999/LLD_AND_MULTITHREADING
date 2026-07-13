package A_basic.model;

import A_basic.model.enums.TransactionStatus;
import A_basic.model.enums.TransactionType;

public class Transaction { private final String transactionId; private final String accountId; private final TransactionType transactionType; private final double amount; private final TransactionStatus transactionStatus; public Transaction(String transactionId, String accountId, TransactionType transactionType, double amount) { this.transactionId = transactionId; this.accountId = accountId; this.transactionType = transactionType; this.amount = amount; this.transactionStatus = TransactionStatus.SUCCESS; } @Override public String toString() { return "Transaction{" + "transactionId='" + transactionId + "'" + ", accountId='" + accountId + "'" + ", transactionType=" + transactionType + ", amount=" + amount + ", transactionStatus=" + transactionStatus + '}'; } public String getTransactionId() { return transactionId; } public String getAccountId() { return accountId; } public TransactionType getTransactionType() { return transactionType; } public double getAmount() { return amount; } public TransactionStatus getTransactionStatus() { return transactionStatus; } }
