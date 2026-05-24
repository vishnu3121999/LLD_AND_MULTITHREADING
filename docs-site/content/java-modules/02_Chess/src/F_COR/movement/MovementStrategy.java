package F_COR.movement;

import F_COR.board.ChessBoard;
import F_COR.model.Move;
import F_COR.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}


