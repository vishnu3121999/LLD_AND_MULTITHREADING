package src.model.piece;

import model.Move;
import model.board.Board;

public class Bishop extends Piece {
    public Bishop(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move) {
        if (!isValidDestination(board, move)) {
            return false;
        }
        return isDiagonalPathClear(board, move);
    }
}
