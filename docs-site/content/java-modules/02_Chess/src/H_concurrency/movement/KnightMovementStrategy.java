package H_concurrency.movement;

import H_concurrency.board.ChessBoard;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;

public class KnightMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return (row == 2 && col == 1) || (row == 1 && col == 2);
    }
}




