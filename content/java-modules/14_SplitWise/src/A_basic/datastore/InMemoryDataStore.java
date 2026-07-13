package A_basic.datastore;

        import A_basic.model.User;
import A_basic.model.Group;
import A_basic.model.Expense;
import A_basic.model.Split;
import A_basic.model.Balance;

        import java.util.HashMap;
        import java.util.Map;
import java.util.ArrayList;
import java.util.List;

        public class InMemoryDataStore implements DataStore {
            private final Map<String, User> userMap;
    private final Map<String, Group> groupMap;
    private final Map<String, Expense> expenseMap;
    private final Map<String, Split> splitMap;
    private final Map<String, Balance> balanceMap;

            public InMemoryDataStore() {
                this.userMap = new HashMap<>();
        this.groupMap = new HashMap<>();
        this.expenseMap = new HashMap<>();
        this.splitMap = new HashMap<>();
        this.balanceMap = new HashMap<>();
            }


            @Override
            public User getUser(String key) {
                return userMap.get(key);
            }

            @Override
            public void putUser(String key, User value) {
                userMap.put(key, value);
            }

            @Override
            public boolean containsUser(String key) {
                return userMap.containsKey(key);
            }

            @Override
            public User removeUser(String key) {
                return userMap.remove(key);
            }
            @Override
            public Group getGroup(String key) {
                return groupMap.get(key);
            }

            @Override
            public void putGroup(String key, Group value) {
                groupMap.put(key, value);
            }

            @Override
            public boolean containsGroup(String key) {
                return groupMap.containsKey(key);
            }

            @Override
            public Group removeGroup(String key) {
                return groupMap.remove(key);
            }
            @Override
            public Expense getExpense(String key) {
                return expenseMap.get(key);
            }

            @Override
            public void putExpense(String key, Expense value) {
                expenseMap.put(key, value);
            }

            @Override
            public boolean containsExpense(String key) {
                return expenseMap.containsKey(key);
            }

            @Override
            public Expense removeExpense(String key) {
                return expenseMap.remove(key);
            }
            @Override
            public Split getSplit(String key) {
                return splitMap.get(key);
            }

            @Override
            public void putSplit(String key, Split value) {
                splitMap.put(key, value);
            }

            @Override
            public boolean containsSplit(String key) {
                return splitMap.containsKey(key);
            }

            @Override
            public Split removeSplit(String key) {
                return splitMap.remove(key);
            }
            @Override
            public Balance getBalance(String key) {
                return balanceMap.get(key);
            }

            @Override
            public void putBalance(String key, Balance value) {
                balanceMap.put(key, value);
            }

            @Override
            public boolean containsBalance(String key) {
                return balanceMap.containsKey(key);
            }

            @Override
            public Balance removeBalance(String key) {
                return balanceMap.remove(key);
            }

            @Override
            public List<Balance> getBalanceList() {
                return new ArrayList<>(balanceMap.values());
            }
        }
