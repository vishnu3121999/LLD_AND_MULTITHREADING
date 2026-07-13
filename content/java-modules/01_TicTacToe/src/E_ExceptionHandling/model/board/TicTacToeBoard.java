package E_ExceptionHandling.model.board;

import E_ExceptionHandling.model.Move;
import E_ExceptionHandling.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}


