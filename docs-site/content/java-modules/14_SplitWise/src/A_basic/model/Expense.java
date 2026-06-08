package A_basic.model;

import A_basic.model.enums.ExpenseStatus;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Expense {
    private final String expenseId;
    private final String paidByUserId;
    private final double amount;
    private final List<String> splitList;
    private ExpenseStatus expenseStatus;
    public Expense(String expenseId, String paidByUserId, double amount) { this.expenseId = expenseId; this.paidByUserId = paidByUserId; this.amount = amount; this.splitList = new ArrayList<>(); this.expenseStatus = ExpenseStatus.CREATED; }
    public void addSplit(String splitId) { splitList.add(splitId); }
    @Override public String toString() { return "Expense{" + "expenseId='" + expenseId + "'" + ", paidByUserId='" + paidByUserId + "'" + ", amount=" + amount + ", splitList=" + splitList + ", expenseStatus=" + expenseStatus + '}'; }
    public String getExpenseId() { return expenseId; }
    public String getPaidByUserId() { return paidByUserId; }
    public double getAmount() { return amount; }
    public List<String> getSplitList() { return Collections.unmodifiableList(splitList); }
}
