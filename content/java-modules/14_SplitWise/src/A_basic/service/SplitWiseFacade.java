package A_basic.service;

import A_basic.datastore.DataStore;
import A_basic.model.Balance;
import A_basic.model.Expense;
import A_basic.model.Group;
import A_basic.model.Split;
import A_basic.model.User;

import java.util.List;

public class SplitWiseFacade {
    private final DataStore dataStore;
    public SplitWiseFacade(DataStore dataStore) { this.dataStore = dataStore; }

    // User methods

    public void addExpense(String groupId, String expenseId, String paidByUserId, double amount, List<String> participantUserList) {
        Expense expense = new Expense(expenseId, paidByUserId, amount);
        double splitAmount = amount / participantUserList.size();
        int index = 1;
        for (String userId : participantUserList) {
            String splitId = expenseId + "-split-" + index++;
            Split split = new Split(splitId, userId, splitAmount);
            dataStore.putSplit(split.getSplitId(), split);
            expense.addSplit(splitId);
            if (!userId.equals(paidByUserId)) updateBalance(userId, paidByUserId, splitAmount);
        }
        dataStore.putExpense(expense.getExpenseId(), expense);
        dataStore.getGroup(groupId).addExpense(expenseId);
    }

    // System methods

    public void updateBalance(String fromUserId, String toUserId, double amount) {
        String balanceId = fromUserId + "->" + toUserId;
        if (!dataStore.containsBalance(balanceId)) dataStore.putBalance(balanceId, new Balance(balanceId, fromUserId, toUserId));
        dataStore.getBalance(balanceId).addAmount(amount);
    }

    // Admin methods

    public void addUser(String userId, String name) { User user = new User(userId, name); dataStore.putUser(user.getUserId(), user); }
    public void addGroup(String groupId, String name) { Group group = new Group(groupId, name); dataStore.putGroup(group.getGroupId(), group); }
    public void addMember(String groupId, String userId) { dataStore.getGroup(groupId).addUser(userId); }

    // Util/helper methods
}
