package A_basicV2.service;

import A_basicV2.board.ChessBoard;
import A_basicV2.model.Color;
import A_basicV2.model.Move;
import A_basicV2.model.Piece;
import A_basicV2.model.Position;

public class MoveValidator {
    public boolean isValid(ChessGame game, Move move) {
        ChessBoard board = game.getBoard();
        if (!isInsideBoard(board, move)) {
            return false;
        }

        if (isSameSquare(move)) {
            return false;
        }

        if (!hasMovingPiece(board, move)) {
            return false;
        }

        if (!isPlayerOwningPiece(game, board, move)) {
            return false;
        }

        if (isCapturingOwnPiece(board, move)) {
            return false;
        }

        return canPieceMove(board, move);
    }

    private boolean isInsideBoard(ChessBoard board, Move move) {
        return move.getFrom().isValid(board.getSize()) && move.getTo().isValid(board.getSize());
    }

    private boolean isSameSquare(Move move) {
        return move.getFrom().getRow() == move.getTo().getRow()
                && move.getFrom().getCol() == move.getTo().getCol();
    }

    private boolean hasMovingPiece(ChessBoard board, Move move) {
        return board.getPiece(move.getFrom()) != null;
    }

    private boolean isPlayerOwningPiece(ChessGame game, ChessBoard board, Move move) {
        Piece movingPiece = board.getPiece(move.getFrom());
        Color playerColor = game.getPlayerColor(move.getPlayer());
        return playerColor != null && movingPiece.getColor() == playerColor;
    }

    private boolean isCapturingOwnPiece(ChessBoard board, Move move) {
        Piece movingPiece = board.getPiece(move.getFrom());
        Piece targetPiece = board.getPiece(move.getTo());
        return targetPiece != null && targetPiece.getColor() == movingPiece.getColor();
    }

    private boolean canPieceMove(ChessBoard board, Move move) {
        Piece movingPiece = board.getPiece(move.getFrom());
        return isValidMovement(board, movingPiece, move);
    }

    private boolean isValidMovement(ChessBoard board, Piece piece, Move move) {
        int rowDelta = move.rowDelta();
        int colDelta = move.colDelta();
        int absRow = Math.abs(rowDelta);
        int absCol = Math.abs(colDelta);

        switch (piece.getType()) {
            case KING:
                return absRow <= 1 && absCol <= 1 && absRow + absCol > 0;
            case QUEEN:
                return (rowDelta == 0 || colDelta == 0 || absRow == absCol) && board.isPathClear(move);
            case ROOK:
                return (rowDelta == 0 || colDelta == 0) && board.isPathClear(move);
            case BISHOP:
                return absRow == absCol && board.isPathClear(move);
            case KNIGHT:
                return (absRow == 2 && absCol == 1) || (absRow == 1 && absCol == 2);
            case PAWN:
                return isValidPawnMove(board, piece, move);
            default:
                return false;
        }
    }

    private boolean isValidPawnMove(ChessBoard board, Piece piece, Move move) {
        int direction = piece.getColor() == Color.WHITE ? -1 : 1;
        int startRow = piece.getColor() == Color.WHITE ? 6 : 1;
        int rowDelta = move.rowDelta();
        int colDelta = move.colDelta();
        Piece target = board.getPiece(move.getTo());

        if (colDelta == 0 && rowDelta == direction && target == null) {
            return true;
        }

        if (colDelta == 0 && rowDelta == 2 * direction && move.getFrom().getRow() == startRow) {
            Position middle = Position.of(move.getFrom().getRow() + direction, move.getFrom().getCol());
            return board.getPiece(middle) == null && target == null;
        }

        return Math.abs(colDelta) == 1
                && rowDelta == direction
                && target != null
                && target.getColor() != piece.getColor();
    }
}
