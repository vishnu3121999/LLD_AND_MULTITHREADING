package E_ExceptionHandling.model.game.winstrategy;

import E_ExceptionHandling.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}


