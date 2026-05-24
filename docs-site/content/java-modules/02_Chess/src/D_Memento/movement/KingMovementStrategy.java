package D_Memento.movement;

import D_Memento.board.ChessBoard;
import D_Memento.model.Move;
import D_Memento.model.Piece;

public class KingMovementStrategy implements MovementStrategy {
    @Override
    public boolean canMove(ChessBoard board, Piece piece, Move move) {
        int row = Math.abs(move.rowDelta());
        int col = Math.abs(move.colDelta());
        return row <= 1 && col <= 1 && row + col > 0;
    }
}

