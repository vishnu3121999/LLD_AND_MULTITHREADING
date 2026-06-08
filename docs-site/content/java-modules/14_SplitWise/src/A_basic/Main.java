package A_basic;

import A_basic.datastore.DataStore;
import A_basic.datastore.InMemoryDataStore;
import A_basic.service.SplitWiseFacade;

import java.util.List;
import java.util.UUID;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== SplitWise Basic Demo ===");
        DataStore dataStore = new InMemoryDataStore();
        SplitWiseFacade facade = new SplitWiseFacade(dataStore);
        String groupId = id("group");
        String userA = id("user");
        String userB = id("user");
        String userC = id("user");
        String expenseId = id("expense");
        facade.addUser(userA, "Asha");
        facade.addUser(userB, "Bala");
        facade.addUser(userC, "Charu");
        facade.addGroup(groupId, "Goa Trip");
        facade.addMember(groupId, userA);
        facade.addMember(groupId, userB);
        facade.addMember(groupId, userC);
        facade.addExpense(groupId, expenseId, userA, 900.0, List.of(userA, userB, userC));
        System.out.println(dataStore.getExpense(expenseId));
        for (A_basic.model.Balance balance : dataStore.getBalanceList()) System.out.println(balance);
    }
    private static String id(String prefix) { return prefix + "-" + UUID.randomUUID(); }
}
