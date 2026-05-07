package basic_strategy_command.model.board.winstrategy;

import basic_strategy_command.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}
