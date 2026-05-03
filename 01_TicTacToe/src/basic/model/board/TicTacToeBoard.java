package basic.model.board;

import basic.model.Move;
import basic.model.enums.Symbol;

public interface TicTacToeBoard {
    public boolean applyMove(Move move);
    public boolean hasWinner();
    public boolean isFull();
    public void print();
}

