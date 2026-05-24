package B_Strategy.model;

public class Position {
    private final int row;
    private final int col;

    private Position(int row, int col) {
        this.row = row;
        this.col = col;
    }

    public static Position of(int row, int col) {
        return new Position(row, col);
    }

    public int getRow() {
        return row;
    }

    public int getCol() {
        return col;
    }

    public boolean isValid(int boardSize) {
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }

    @Override
    public String toString() {
        return "(" + row + "," + col + ")";
    }
}
