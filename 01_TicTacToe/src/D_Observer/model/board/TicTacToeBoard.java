package D_Observer.model.board;

import D_Observer.model.Move;
import D_Observer.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}

