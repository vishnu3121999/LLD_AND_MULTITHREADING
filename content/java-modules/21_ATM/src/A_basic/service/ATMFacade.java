package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.ATM;
import A_basic.model.Account;
import A_basic.model.Card;
import A_basic.model.Transaction;
import A_basic.model.enums.TransactionType;

public class ATMFacade {
    private final DataStore dataStore;
    public ATMFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public double checkBalance(String cardId, String pin) { Card card = authenticate(cardId, pin); return dataStore.getAccount(card.getAccountId()).getBalance(); }
    public String withdraw(String transactionId, String atmId, String cardId, String pin, double amount) { Card card = authenticate(cardId, pin); Account account = dataStore.getAccount(card.getAccountId()); ATM atm = dataStore.getATM(atmId); account.debit(amount); atm.dispense(amount); Transaction transaction = new Transaction(transactionId, account.getAccountId(), TransactionType.WITHDRAW, amount); dataStore.putTransaction(transaction.getTransactionId(), transaction); return transactionId; }
    public String deposit(String transactionId, String atmId, String cardId, String pin, double amount) { Card card = authenticate(cardId, pin); Account account = dataStore.getAccount(card.getAccountId()); ATM atm = dataStore.getATM(atmId); account.credit(amount); atm.acceptCash(amount); Transaction transaction = new Transaction(transactionId, account.getAccountId(), TransactionType.DEPOSIT, amount); dataStore.putTransaction(transaction.getTransactionId(), transaction); return transactionId; }

    // System methods

    public Card authenticate(String cardId, String pin) { Card card = dataStore.getCard(cardId); card.matchesPin(pin); return card; }

    // Admin methods

    public void addATM(String atmId, String location, double cashBalance) { ATM atm = new ATM(atmId, location, cashBalance); dataStore.putATM(atm.getAtmId(), atm); }
    public void addAccount(String accountId, double balance) { Account account = new Account(accountId, balance); dataStore.putAccount(account.getAccountId(), account); }
    public void addCard(String cardId, String accountId, String pin) { Card card = new Card(cardId, accountId, pin); dataStore.putCard(card.getCardId(), card); }

    // Util/helper methods
}
