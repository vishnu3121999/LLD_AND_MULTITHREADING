package F_ConcurrencyV2.model.game.winstrategy;

import F_ConcurrencyV2.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}



