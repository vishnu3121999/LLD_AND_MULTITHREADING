package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.ATMFacade;

import java.util.UUID;

public class Main { public static void main(String[] args) { System.out.println("=== ATM Basic Demo ==="); DataStore dataStore = new InMemoryDataStore(); ATMFacade facade = new ATMFacade(dataStore); String atmId = id("atm"); String accountId = id("account"); String cardId = id("card"); String withdrawId = id("txn"); String depositId = id("txn"); facade.addATM(atmId, "MG Road", 10000); facade.addAccount(accountId, 5000); facade.addCard(cardId, accountId, "1234"); facade.withdraw(withdrawId, atmId, cardId, "1234", 1000); facade.deposit(depositId, atmId, cardId, "1234", 500); System.out.println(dataStore.getAccount(accountId)); System.out.println(dataStore.getATM(atmId)); System.out.println(dataStore.getTransaction(withdrawId)); } private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); } }
