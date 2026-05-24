package F_COR.movement;

import F_COR.board.ChessBoard;
import F_COR.model.Move;
import F_COR.model.Piece;

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


