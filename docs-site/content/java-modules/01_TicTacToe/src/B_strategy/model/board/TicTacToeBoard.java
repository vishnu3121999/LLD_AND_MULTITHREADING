package B_strategy.model.board;

import B_strategy.model.Move;
import B_strategy.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}
