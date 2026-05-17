package C_command.model.board;

import C_command.model.Move;
import C_command.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}
