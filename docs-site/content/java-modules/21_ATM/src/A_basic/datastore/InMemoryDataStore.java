package A_basic.datastore;

        import A_basic.model.ATM;
import A_basic.model.Account;
import A_basic.model.Card;
import A_basic.model.Transaction;

        import java.util.HashMap;
        import java.util.Map;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, ATM> atmMap;
    private final Map<String, Account> accountMap;
    private final Map<String, Card> cardMap;
    private final Map<String, Transaction> transactionMap;

            public InMemoryDataStore() {
                this.atmMap = new HashMap<>();
        this.accountMap = new HashMap<>();
        this.cardMap = new HashMap<>();
        this.transactionMap = new HashMap<>();
            }


            @Override
            public ATM getATM(String key) {
                return atmMap.get(key);
            }

            @Override
            public void putATM(String key, ATM value) {
                atmMap.put(key, value);
            }

            @Override
            public boolean containsATM(String key) {
                return atmMap.containsKey(key);
            }

            @Override
            public ATM removeATM(String key) {
                return atmMap.remove(key);
            }
            @Override
            public Account getAccount(String key) {
                return accountMap.get(key);
            }

            @Override
            public void putAccount(String key, Account value) {
                accountMap.put(key, value);
            }

            @Override
            public boolean containsAccount(String key) {
                return accountMap.containsKey(key);
            }

            @Override
            public Account removeAccount(String key) {
                return accountMap.remove(key);
            }
            @Override
            public Card getCard(String key) {
                return cardMap.get(key);
            }

            @Override
            public void putCard(String key, Card value) {
                cardMap.put(key, value);
            }

            @Override
            public boolean containsCard(String key) {
                return cardMap.containsKey(key);
            }

            @Override
            public Card removeCard(String key) {
                return cardMap.remove(key);
            }
            @Override
            public Transaction getTransaction(String key) {
                return transactionMap.get(key);
            }

            @Override
            public void putTransaction(String key, Transaction value) {
                transactionMap.put(key, value);
            }

            @Override
            public boolean containsTransaction(String key) {
                return transactionMap.containsKey(key);
            }

            @Override
            public Transaction removeTransaction(String key) {
                return transactionMap.remove(key);
            }
        }
