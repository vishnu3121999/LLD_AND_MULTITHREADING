package basic_strategy.model.board;

import basic_strategy.model.Move;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean hasWinner();
    boolean isFull();
    void print();
}
