package C_Factory.movement;

import C_Factory.board.ChessBoard;
import C_Factory.model.Move;
import C_Factory.model.Piece;

public class KingMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return row <= 1 && col <= 1 && row + col > 0;
    }
}
