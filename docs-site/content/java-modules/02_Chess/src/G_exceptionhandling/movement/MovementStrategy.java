package G_exceptionhandling.movement;

import G_exceptionhandling.board.ChessBoard;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}



