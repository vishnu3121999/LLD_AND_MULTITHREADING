package A_basic.datastore;

        import A_basic.model.ATM;
import A_basic.model.Account;
import A_basic.model.Card;
import A_basic.model.Transaction;

        public interface DataStore {

            ATM getATM(String key);

            void putATM(String key, ATM value);

            boolean containsATM(String key);

            ATM removeATM(String key);
            Account getAccount(String key);

            void putAccount(String key, Account value);

            boolean containsAccount(String key);

            Account removeAccount(String key);
            Card getCard(String key);

            void putCard(String key, Card value);

            boolean containsCard(String key);

            Card removeCard(String key);
            Transaction getTransaction(String key);

            void putTransaction(String key, Transaction value);

            boolean containsTransaction(String key);

            Transaction removeTransaction(String key);
        }
