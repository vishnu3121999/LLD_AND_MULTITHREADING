package E_ExceptionHandling.model;

import E_ExceptionHandling.model.enums.Symbol;

public class Move {
    private int row;
    private int col;
    // In chess instead of symbol, there will be srcRow, srcCol
    private Symbol symbol;

    public Move(int row, int col, Symbol symbol) {
        this.row = row;
        this.col = col;
        this.symbol = symbol;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
    }

    public Symbol getSymbol() {
        return symbol;
    }

    public void setSymbol(Symbol symbol) {
        this.symbol = symbol;
    }
}


