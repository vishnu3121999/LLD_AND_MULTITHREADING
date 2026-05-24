package I_AdditionalFeatures.movement;

import I_AdditionalFeatures.board.ChessBoard;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;

public class LineMovementStrategy implements MovementStrategy {
    private final boolean allowStraight;
    private final boolean allowDiagonal;

    public LineMovementStrategy(boolean allowStraight, boolean allowDiagonal) {
        this.allowStraight = allowStraight;
        this.allowDiagonal = allowDiagonal;
    }

    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        boolean straight = row == 0 || col == 0;
        boolean diagonal = row == col;
        return ((allowStraight && straight) || (allowDiagonal && diagonal)) && board.isPathClear(move);
    }
}





