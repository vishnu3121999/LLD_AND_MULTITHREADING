package F_Concurrency.model.board;

import F_Concurrency.model.Move;
import F_Concurrency.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}


