package G_Composite.model.game.winstrategy;

import G_Composite.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}


