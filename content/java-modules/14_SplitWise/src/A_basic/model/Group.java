package A_basic.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Group {
    private final String groupId;
    private final String name;
    private final List<String> userList;
    private final List<String> expenseList;
    public Group(String groupId, String name) { this.groupId = groupId; this.name = name; this.userList = new ArrayList<>(); this.expenseList = new ArrayList<>(); }
    public void addUser(String userId) { userList.add(userId); }
    public void addExpense(String expenseId) { expenseList.add(expenseId); }
    @Override public String toString() { return "Group{" + "groupId='" + groupId + "'" + ", name='" + name + "'" + ", userList=" + userList + ", expenseList=" + expenseList + '}'; }
    public String getGroupId() { return groupId; }
    public String getName() { return name; }
    public List<String> getUserList() { return Collections.unmodifiableList(userList); }
    public List<String> getExpenseList() { return Collections.unmodifiableList(expenseList); }
}
