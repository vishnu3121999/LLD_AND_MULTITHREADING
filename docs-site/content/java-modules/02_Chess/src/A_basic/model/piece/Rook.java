package src.model.piece;

import model.Move;
import model.board.Board;

public class Rook extends Piece {
    public Rook(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move) {
        if (!isValidDestination(board, move)) {
            return false;
        }
        if (move.getSrcRow() != move.getDestRow() && move.getSrcCol() != move.getDestCol()) {
            return false;
        }
        return isStraightPathClear(board, move);
    }
}
