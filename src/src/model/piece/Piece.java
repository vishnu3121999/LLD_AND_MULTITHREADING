package src.model.piece;

import model.Move;
import model.board.Board;

public abstract class Piece {
    private boolean isWhite;

    protected Piece(boolean isWhite) {
        this.isWhite = isWhite;
    }

    public abstract boolean canMove(Board board, Move move);

    public boolean isWhite() {
        return isWhite;
    }

    public void setWhite(boolean white) {
        isWhite = white;
    }

    protected boolean isValidDestination(Board board, Move move) {
        if (!isInsideBoard(move.getSrcRow(), move.getSrcCol()) || !isInsideBoard(move.getDestRow(), move.getDestCol())) {
            return false;
        }
        if (move.getSrcRow() == move.getDestRow() && move.getSrcCol() == move.getDestCol()) {
            return false;
        }
        Piece targetPiece = board.getPiece(move.getDestRow(), move.getDestCol());
        return targetPiece == null || targetPiece.isWhite() != isWhite;
    }

    protected boolean isInsideBoard(int row, int col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    protected boolean isStraightPathClear(Board board, Move move) {
        int rowStep = Integer.compare(move.getDestRow(), move.getSrcRow());
        int colStep = Integer.compare(move.getDestCol(), move.getSrcCol());

        if (rowStep != 0 && colStep != 0) {
            return false;
        }

        int row = move.getSrcRow() + rowStep;
        int col = move.getSrcCol() + colStep;
        while (row != move.getDestRow() || col != move.getDestCol()) {
            if (board.getPiece(row, col) != null) {
                return false;
            }
            row += rowStep;
            col += colStep;
        }
        return true;
    }

    protected boolean isDiagonalPathClear(Board board, Move move) {
        int rowDiff = move.getDestRow() - move.getSrcRow();
        int colDiff = move.getDestCol() - move.getSrcCol();
        if (Math.abs(rowDiff) != Math.abs(colDiff)) {
            return false;
        }

        int rowStep = Integer.compare(move.getDestRow(), move.getSrcRow());
        int colStep = Integer.compare(move.getDestCol(), move.getSrcCol());
        int row = move.getSrcRow() + rowStep;
        int col = move.getSrcCol() + colStep;

        while (row != move.getDestRow() && col != move.getDestCol()) {
            if (board.getPiece(row, col) != null) {
                return false;
            }
            row += rowStep;
            col += colStep;
        }
        return true;
    }
}
