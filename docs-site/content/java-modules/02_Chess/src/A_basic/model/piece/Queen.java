package src.model.piece;

import model.Move;
import model.board.Board;

public class Queen extends Piece {
    public Queen(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move) {
        if (!isValidDestination(board, move)) {
            return false;
        }

        int rowDiff = Math.abs(move.getDestRow() - move.getSrcRow());
        int colDiff = Math.abs(move.getDestCol() - move.getSrcCol());

        if (rowDiff == colDiff) {
            return isDiagonalPathClear(board, move);
        }
        if (move.getSrcRow() == move.getDestRow() || move.getSrcCol() == move.getDestCol()) {
            return isStraightPathClear(board, move);
        }
        return false;
    }
}
