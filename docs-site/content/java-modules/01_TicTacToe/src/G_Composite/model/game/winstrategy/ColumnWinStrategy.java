package G_Composite.model.game.winstrategy;

import G_Composite.model.enums.Symbol;

public class ColumnWinStrategy implements WinStrategy {
    @Override
    public boolean hasWinner(Symbol[][] grid) {
        int n = grid.length;

        for (int j = 0; j < n; j++) {
            Symbol first = grid[0][j];
            if (first == Symbol.EMPTY) {
                continue;
            }

            boolean win = true;
            for (int i = 1; i < n; i++) {
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
