package H_concurrency.movement;

import H_concurrency.board.ChessBoard;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}




