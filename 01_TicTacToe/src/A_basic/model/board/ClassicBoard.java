package A_basic.model.board;

import A_basic.model.*;
import A_basic.model.enums.Symbol;


public class ClassicBoard implements TicTacToeBoard{
    // in chess, it will be Piece[][] grid
    private Symbol[][] grid;

    public ClassicBoard(int n){
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

    public boolean hasWinner() {
        int n = grid.length;
        // Check rows
        for (int i = 0; i < n; i++) {
            Symbol first = grid[i][0];
            if (first == Symbol.EMPTY) continue;
            boolean win = true;
            for (int j = 1; j < n; j++) {
                if (grid[i][j] != first) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }

        // Check columns
        for (int j = 0; j < n; j++) {
            Symbol first = grid[0][j];
            if (first == Symbol.EMPTY) continue;

            boolean win = true;
            for (int i = 1; i < n; i++) {
                if (grid[i][j] != first) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }

        // Check main diagonal
        Symbol firstDiag = grid[0][0];
        if (firstDiag != Symbol.EMPTY) {
            boolean win = true;
            for (int i = 1; i < n; i++) {
                if (grid[i][i] != firstDiag) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
        // Check anti-diagonal
        Symbol firstAntiDiag = grid[0][n - 1];
        if (firstAntiDiag != Symbol.EMPTY) {
            boolean win = true;
            for (int i = 1; i < n; i++) {
                if (grid[i][n - 1 - i] != firstAntiDiag) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
        return false;
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
