package src.model;

public class Move {
    private int srcRow;
    private int srcCol;
    private int destRow;
    private int destCol;

    public Move(int srcRow, int srcCol, int destRow, int destCol) {
        this.srcRow = srcRow;
        this.srcCol = srcCol;
        this.destRow = destRow;
        this.destCol = destCol;
    }

    public int getSrcRow() {
        return srcRow;
    }

    public void setSrcRow(int srcRow) {
        this.srcRow = srcRow;
    }

    public int getSrcCol() {
        return srcCol;
    }

    public void setSrcCol(int srcCol) {
        this.srcCol = srcCol;
    }

    public int getDestRow() {
        return destRow;
    }

    public void setDestRow(int destRow) {
        this.destRow = destRow;
    }

    public int getDestCol() {
        return destCol;
    }

    public void setDestCol(int destCol) {
        this.destCol = destCol;
    }
}
