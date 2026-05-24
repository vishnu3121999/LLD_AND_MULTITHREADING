package B_Strategy.movement;

import B_Strategy.board.ChessBoard;
import B_Strategy.model.Move;
import B_Strategy.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}
