package C_command.model.board;

import C_command.model.Move;

public interface TicTacToeBoard {
    boolean applyMove(Move move);
    boolean removeMove(Move move);
    boolean hasWinner();
    boolean isFull();
    void print();
}
