package src.model.piece;

import model.Move;
import model.board.Board;

public class Pawn extends Piece {
    public Pawn(boolean isWhite) {
        super(isWhite);
    }

    @Override
    public boolean canMove(Board board, Move move) {
        if (!isInsideBoard(move.getSrcRow(), move.getSrcCol()) || !isInsideBoard(move.getDestRow(), move.getDestCol())) {
            return false;
        }

        int direction = isWhite() ? -1 : 1;
        int startRow = isWhite() ? 6 : 1;
        int rowDiff = move.getDestRow() - move.getSrcRow();
        int colDiff = Math.abs(move.getDestCol() - move.getSrcCol());
        Piece targetPiece = board.getPiece(move.getDestRow(), move.getDestCol());

        if (colDiff == 0) {
            if (targetPiece != null) {
                return false;
            }
            if (rowDiff == direction) {
                return true;
            }
            if (move.getSrcRow() == startRow && rowDiff == 2 * direction) {
                int middleRow = move.getSrcRow() + direction;
                return board.getPiece(middleRow, move.getSrcCol()) == null;
            }
            return false;
        }

        return colDiff == 1 && rowDiff == direction && targetPiece != null && targetPiece.isWhite() != isWhite();
    }
}
