package D_Memento.movement;

import D_Memento.board.ChessBoard;
import D_Memento.model.Move;
import D_Memento.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}

