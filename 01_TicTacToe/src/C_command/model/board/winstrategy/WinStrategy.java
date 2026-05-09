package C_command.model.board.winstrategy;

import C_command.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}
