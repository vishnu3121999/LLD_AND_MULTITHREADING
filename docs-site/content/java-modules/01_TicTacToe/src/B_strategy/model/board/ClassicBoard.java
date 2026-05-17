package B_strategy.model.board;

import B_strategy.model.Move;
import B_strategy.model.enums.Symbol;

public class ClassicBoard implements TicTacToeBoard {
    // in chess, it will be Piece[][] grid
    private final Symbol[][] grid;

    public ClassicBoard(int n) {
        grid = new Symbol[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = Symbol.EMPTY;
            }
        }
    }

    // getter
    public Symbol[][] getGrid() {
        return grid;
    }

    public void print() {
        int n = grid.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == Symbol.EMPTY) System.out.print(Symbol.EMPTY + " ");
                else System.out.print(grid[i][j] + "     ");
            }
            System.out.println();
        }
    }

    public boolean applyMove(Move move) {
        int row = move.getRow();
        int col = move.getCol();
        if (grid[row][col] != Symbol.EMPTY) return false;
        grid[row][col] = move.getSymbol();
        return true;
    }

    public boolean isFull() {
        int n = grid.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == Symbol.EMPTY) {
                    return false;
                }
            }
        }
        return true;
    }
}
