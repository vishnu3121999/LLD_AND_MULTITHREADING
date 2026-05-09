package A_basic.model.board;

import A_basic.model.Move;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean hasWinner();
    boolean isFull();
    void print();
}
