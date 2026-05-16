package F_Concurrency.model.game.winstrategy;

import F_Concurrency.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}


