package E_Observer.movement;

import E_Observer.board.ChessBoard;
import E_Observer.model.Move;
import E_Observer.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}

