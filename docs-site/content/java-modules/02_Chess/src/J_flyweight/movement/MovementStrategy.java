package J_flyweight.movement;

import J_flyweight.board.ChessBoard;
import J_flyweight.model.Move;
import J_flyweight.model.Piece;

public interface MovementStrategy {
    boolean canMove(ChessBoard board, Piece piece, Move move);
}





