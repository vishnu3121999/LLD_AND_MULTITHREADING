package G_Composite.model.game.winstrategy;

import G_Composite.model.enums.Symbol;

public class RowWinStrategy implements WinStrategy {
    @Override
    public boolean hasWinner(Symbol[][] grid) {
        int n = grid.length;

        for (int i = 0; i < n; i++) {
            Symbol first = grid[i][0];
            if (first == Symbol.EMPTY) {
                continue;
            }

            boolean win = true;
            for (int j = 1; j < n; j++) {
                if (grid[i][j] != first) {
                    win = false;
                    break;
                }
            }

            if (win) {
                return true;
            }
        }

        return false;
    }
}
