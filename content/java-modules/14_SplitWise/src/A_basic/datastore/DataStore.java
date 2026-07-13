package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Group;
import A_basic.model.Expense;
import A_basic.model.Split;
import A_basic.model.Balance;
import java.util.List;

        public interface DataStore {

            User getUser(String key);

            void putUser(String key, User value);

            boolean containsUser(String key);

            User removeUser(String key);
            Group getGroup(String key);

            void putGroup(String key, Group value);

            boolean containsGroup(String key);

            Group removeGroup(String key);
            Expense getExpense(String key);

            void putExpense(String key, Expense value);

            boolean containsExpense(String key);

            Expense removeExpense(String key);
            Split getSplit(String key);

            void putSplit(String key, Split value);

            boolean containsSplit(String key);

            Split removeSplit(String key);
            Balance getBalance(String key);

            void putBalance(String key, Balance value);

            boolean containsBalance(String key);

            Balance removeBalance(String key);

            List<Balance> getBalanceList();
        }
