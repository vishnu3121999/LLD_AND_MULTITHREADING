package D_Observer.model.game.winstrategy;

import D_Observer.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}

