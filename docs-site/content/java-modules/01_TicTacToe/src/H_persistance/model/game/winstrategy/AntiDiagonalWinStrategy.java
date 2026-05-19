package H_persistance.model.game.winstrategy;

import H_persistance.model.enums.Symbol;

public class AntiDiagonalWinStrategy implements WinStrategy {
    @Override
    public boolean hasWinner(Symbol[][] grid) {
        int n = grid.length;
        Symbol first = grid[0][n - 1];

        if (first == Symbol.EMPTY) {
            return false;
        }

        for (int i = 1; i < n; i++) {
            if (grid[i][n - 1 - i] != first) {
                return false;
            }
        }

        return true;
    }
}
