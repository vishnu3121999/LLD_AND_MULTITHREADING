package src.model.piece;

import model.Move;
import model.board.Board;

public class Knight extends Piece {
    public Knight(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move) {
        if (!isValidDestination(board, move)) {
            return false;
        }
        int rowDiff = Math.abs(move.getDestRow() - move.getSrcRow());
        int colDiff = Math.abs(move.getDestCol() - move.getSrcCol());
        return rowDiff * colDiff == 2;
    }
}
