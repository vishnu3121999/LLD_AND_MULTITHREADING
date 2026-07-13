package E_Observer.movement;

import E_Observer.board.ChessBoard;
import E_Observer.model.Move;
import E_Observer.model.Piece;

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

