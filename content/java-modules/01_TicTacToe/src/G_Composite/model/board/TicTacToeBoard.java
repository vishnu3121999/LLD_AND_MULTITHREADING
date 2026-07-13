package G_Composite.model.board;

import G_Composite.model.Move;
import G_Composite.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}


