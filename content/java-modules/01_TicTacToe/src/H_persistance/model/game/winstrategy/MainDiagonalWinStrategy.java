package H_persistance.model.game.winstrategy;

import H_persistance.model.enums.Symbol;

public class MainDiagonalWinStrategy implements WinStrategy {
    @Override
    public boolean hasWinner(Symbol[][] grid) {
        int n = grid.length;
        Symbol first = grid[0][0];

        if (first == Symbol.EMPTY) {
            return false;
        }

        for (int i = 1; i < n; i++) {
            if (grid[i][i] != first) {
                return false;
            }
        }

        return true;
    }
}
