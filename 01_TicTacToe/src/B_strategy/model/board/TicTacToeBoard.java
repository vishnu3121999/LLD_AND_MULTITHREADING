package B_strategy.model.board;

import B_strategy.model.Move;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean hasWinner();
    boolean isFull();
    void print();
}
