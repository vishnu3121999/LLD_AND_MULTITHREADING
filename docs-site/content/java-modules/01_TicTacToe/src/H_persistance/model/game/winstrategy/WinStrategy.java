package H_persistance.model.game.winstrategy;

import H_persistance.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}


