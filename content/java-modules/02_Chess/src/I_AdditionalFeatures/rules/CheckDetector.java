package I_AdditionalFeatures.rules;

import I_AdditionalFeatures.board.ChessBoard;
import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.model.PieceType;
import I_AdditionalFeatures.model.Position;
import I_AdditionalFeatures.service.ChessGame;

public class CheckDetector {
    public boolean isInCheck(ChessGame game, Color kingColor) {
        Position kingPosition = findKing(game.getBoard(), kingColor);
        return kingPosition == null || isSquareAttacked(game, kingPosition, kingColor.opposite());
    }

    public boolean isSquareAttacked(ChessGame game, Position position, Color attackerColor) {
        ChessBoard board = game.getBoard();
        for (int row = 0; row < board.getSize(); row++) {
            for (int col = 0; col < board.getSize(); col++) {
                Position from = Position.of(row, col);
                Piece piece = board.getPiece(from);
                if (piece != null && piece.getColor() == attackerColor && attacks(board, piece, from, position)) {
                    return true;
                }
            }
        }
        return false;
    }

    private Position findKing(ChessBoard board, Color color) {
        for (int row = 0; row < board.getSize(); row++) {
            for (int col = 0; col < board.getSize(); col++) {
                Position position = Position.of(row, col);
                Piece piece = board.getPiece(position);
                if (piece != null && piece.getType() == PieceType.KING && piece.getColor() == color) {
                    return position;
                }
            }
        }
        return null;
    }

    private boolean attacks(ChessBoard board, Piece piece, Position from, Position target) {
        int rowDelta = target.getRow() - from.getRow();
        int colDelta = target.getCol() - from.getCol();
        int absRow = Math.abs(rowDelta);
        int absCol = Math.abs(colDelta);

        switch (piece.getType()) {
            case KING:
                return absRow <= 1 && absCol <= 1 && absRow + absCol > 0;
            case QUEEN:
                return (rowDelta == 0 || colDelta == 0 || absRow == absCol)
                        && board.isPathClear(new Move(null, from, target));
            case ROOK:
                return (rowDelta == 0 || colDelta == 0)
                        && board.isPathClear(new Move(null, from, target));
            case BISHOP:
                return absRow == absCol && board.isPathClear(new Move(null, from, target));
            case KNIGHT:
                return (absRow == 2 && absCol == 1) || (absRow == 1 && absCol == 2);
            case PAWN:
                int direction = piece.getColor() == Color.WHITE ? -1 : 1;
                return rowDelta == direction && absCol == 1;
            default:
                return false;
        }
    }
}
