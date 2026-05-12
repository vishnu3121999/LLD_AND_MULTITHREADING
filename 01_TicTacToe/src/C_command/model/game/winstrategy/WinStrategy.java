package C_command.model.game.winstrategy;

import C_command.model.enums.Symbol;

public interface WinStrategy {
    boolean hasWinner(Symbol[][] grid);
}
