package K_persistence.movement;

import K_persistence.board.ChessBoard;
import K_persistence.model.Move;
import K_persistence.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}





