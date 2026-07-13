package A_basic.model;

import A_basic.model.enums.TableStatus;

public class DiningTable {
    private final String diningTableId;
    private final int capacity;
    private TableStatus tableStatus;
    public DiningTable(String diningTableId, int capacity) { this.diningTableId = diningTableId; this.capacity = capacity; this.tableStatus = TableStatus.AVAILABLE; }
    public void reserve() { tableStatus = TableStatus.RESERVED; }
    @Override public String toString() { return "DiningTable{" + "diningTableId='" + diningTableId + "'" + ", capacity=" + capacity + ", tableStatus=" + tableStatus + '}'; }
    public String getDiningTableId() { return diningTableId; }
    public int getCapacity() { return capacity; }
    public TableStatus getTableStatus() { return tableStatus; }
}
