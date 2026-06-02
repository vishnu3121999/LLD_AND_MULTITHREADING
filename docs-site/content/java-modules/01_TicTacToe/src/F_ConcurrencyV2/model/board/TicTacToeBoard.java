package F_ConcurrencyV2.model.board;

import F_ConcurrencyV2.model.Move;
import F_ConcurrencyV2.model.enums.Symbol;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean isFull();
    void print();
    Symbol[][] getGrid();
}



