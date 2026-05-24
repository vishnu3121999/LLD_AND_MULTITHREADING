package F_COR.movement;

import F_COR.board.ChessBoard;
import F_COR.model.Move;
import F_COR.model.Piece;

public class KnightMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return (row == 2 && col == 1) || (row == 1 && col == 2);
    }
}


