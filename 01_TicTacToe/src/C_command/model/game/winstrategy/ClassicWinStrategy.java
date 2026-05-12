package C_command.model.game.winstrategy;

import C_command.model.enums.Symbol;

public class ClassicWinStrategy implements WinStrategy {
    @Override
    public boolean hasWinner(Symbol[][] grid) {
        int n = grid.length;

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
}
