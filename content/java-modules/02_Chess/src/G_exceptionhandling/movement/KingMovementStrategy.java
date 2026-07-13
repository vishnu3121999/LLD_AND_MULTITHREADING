package G_exceptionhandling.movement;

import G_exceptionhandling.board.ChessBoard;
import G_exceptionhandling.model.Move;
import G_exceptionhandling.model.Piece;

public class KingMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return row <= 1 && col <= 1 && row + col > 0;
    }
}



