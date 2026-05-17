package src.model.piece;

import model.Move;
import model.board.Board;

public class King extends Piece {
    public King(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move){
        if (!isValidDestination(board, move)) {
            return false;
        }
        int rowDiff = Math.abs(move.getDestRow() - move.getSrcRow());
        int colDiff = Math.abs(move.getDestCol() - move.getSrcCol());
        return Math.max(rowDiff, colDiff) == 1;
    }
}
