package C_Factory.movement;

import C_Factory.board.ChessBoard;
import C_Factory.model.Move;
import C_Factory.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}
