package B_strategy.model.game.winstrategy;

import B_strategy.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}
