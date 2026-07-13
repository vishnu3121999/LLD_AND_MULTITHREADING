package I_AdditionalFeatures.movement;

import I_AdditionalFeatures.board.ChessBoard;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;

public class KingMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return row <= 1 && col <= 1 && row + col > 0;
    }
}





