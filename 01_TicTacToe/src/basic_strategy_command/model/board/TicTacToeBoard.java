package basic_strategy_command.model.board;

import basic_strategy_command.model.Move;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean hasWinner();
    boolean isFull();
    void print();
}
