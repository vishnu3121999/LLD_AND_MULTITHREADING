package basic_strategy_command.model.board;

import basic_strategy_command.model.Move;
import basic_strategy_command.model.board.winstrategy.WinStrategy;
import basic_strategy_command.model.enums.Symbol;

public class ClassicBoard implements TicTacToeBoard {
    private final Symbol[][] grid;
    private final WinStrategy winStrategy;

    public ClassicBoard(int n, WinStrategy winStrategy) {
        this.winStrategy = winStrategy;
        grid = new Symbol[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = Symbol.EMPTY;
            }
        }
    }

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

    public boolean removeMove(Move move) {
        int row = move.getRow();
        int col = move.getCol();
        if (grid[row][col] == Symbol.EMPTY) return false;
        if (grid[row][col] != move.getSymbol()) return false;
        grid[row][col] = Symbol.EMPTY;
        return true;
    }

    public boolean hasWinner() {
        return winStrategy.hasWinner(grid);
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
