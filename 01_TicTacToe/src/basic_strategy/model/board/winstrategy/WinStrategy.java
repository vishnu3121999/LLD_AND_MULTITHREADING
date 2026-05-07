package basic_strategy.model.board.winstrategy;

import basic_strategy.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}
