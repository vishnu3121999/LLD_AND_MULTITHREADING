package I_AdditionalFeatures.special;

import I_AdditionalFeatures.factory.PieceFactory;
import I_AdditionalFeatures.model.Color;
import I_AdditionalFeatures.model.Move;
import I_AdditionalFeatures.model.Piece;
import I_AdditionalFeatures.model.PieceType;
import I_AdditionalFeatures.model.Position;
import I_AdditionalFeatures.rules.CheckDetector;
import I_AdditionalFeatures.service.ChessGame;

public class SpecialMoveService {
    private final CheckDetector checkDetector;
    private final PieceFactory pieceFactory;

    public SpecialMoveService(CheckDetector checkDetector) {
        this.checkDetector = checkDetector;
        this.pieceFactory = new PieceFactory();
    }

    public boolean isLegalSpecialMove(ChessGame game, Move move) {
        return isLegalCastling(game, move) || isLegalEnPassant(game, move);
    }

    public void applyMove(ChessGame game, Move move, boolean trackState) {
        if (isLegalCastling(game, move)) {
            applyCastling(game, move, trackState);
        } else if (isLegalEnPassant(game, move)) {
            applyEnPassant(game, move);
        } else {
            game.getBoard().applyMove(move);
        }

        applyPromotionIfNeeded(game, move);

        if (trackState) {
            game.markPositionMoved(move.getFrom());
            game.setLastMove(move);
        }
    }

    private boolean isLegalCastling(ChessGame game, Move move) {
        Piece king = game.getBoard().getPiece(move.getFrom());
        if (king == null || king.getType() != PieceType.KING || move.rowDelta() != 0 || Math.abs(move.colDelta()) != 2) {
            return false;
        }

        Color color = king.getColor();
        int homeRow = color == Color.WHITE ? 7 : 0;
        if (move.getFrom().getRow() != homeRow || move.getFrom().getCol() != 4) {
            return false;
        }

        int rookCol = move.getTo().getCol() == 6 ? 7 : 0;
        Position rookPosition = Position.of(homeRow, rookCol);
        Piece rook = game.getBoard().getPiece(rookPosition);
        if (rook == null || rook.getType() != PieceType.ROOK || rook.getColor() != color) {
            return false;
        }

        if (game.hasPositionMoved(move.getFrom()) || game.hasPositionMoved(rookPosition)) {
            return false;
        }

        int direction = move.getTo().getCol() > move.getFrom().getCol() ? 1 : -1;
        for (int col = move.getFrom().getCol() + direction; col != rookCol; col += direction) {
            if (game.getBoard().getPiece(Position.of(homeRow, col)) != null) {
                return false;
            }
        }

        if (checkDetector.isInCheck(game, color)) {
            return false;
        }

        for (int col = move.getFrom().getCol() + direction; col != move.getTo().getCol() + direction; col += direction) {
            if (checkDetector.isSquareAttacked(game, Position.of(homeRow, col), color.opposite())) {
                return false;
            }
        }
        return true;
    }

    private boolean isLegalEnPassant(ChessGame game, Move move) {
        Piece pawn = game.getBoard().getPiece(move.getFrom());
        Move lastMove = game.getLastMove();
        if (pawn == null || pawn.getType() != PieceType.PAWN || lastMove == null) {
            return false;
        }
        if (game.getBoard().getPiece(move.getTo()) != null || Math.abs(move.colDelta()) != 1) {
            return false;
        }

        int direction = pawn.getColor() == Color.WHITE ? -1 : 1;
        if (move.rowDelta() != direction) {
            return false;
        }

        Piece lastMovedPiece = game.getBoard().getPiece(lastMove.getTo());
        return lastMovedPiece != null
                && lastMovedPiece.getType() == PieceType.PAWN
                && lastMovedPiece.getColor() == pawn.getColor().opposite()
                && Math.abs(lastMove.rowDelta()) == 2
                && lastMove.getTo().getRow() == move.getFrom().getRow()
                && lastMove.getTo().getCol() == move.getTo().getCol();
    }

    private void applyCastling(ChessGame game, Move move, boolean trackState) {
        game.getBoard().applyMove(move);
        int row = move.getFrom().getRow();
        if (move.getTo().getCol() == 6) {
            game.getBoard().applyMove(new Move(move.getPlayer(), Position.of(row, 7), Position.of(row, 5)));
            if (trackState) {
                game.markPositionMoved(Position.of(row, 7));
            }
        } else {
            game.getBoard().applyMove(new Move(move.getPlayer(), Position.of(row, 0), Position.of(row, 3)));
            if (trackState) {
                game.markPositionMoved(Position.of(row, 0));
            }
        }
    }

    private void applyEnPassant(ChessGame game, Move move) {
        game.getBoard().removePiece(Position.of(move.getFrom().getRow(), move.getTo().getCol()));
        game.getBoard().applyMove(move);
    }

    private void applyPromotionIfNeeded(ChessGame game, Move move) {
        Piece piece = game.getBoard().getPiece(move.getTo());
        if (piece == null || piece.getType() != PieceType.PAWN) {
            return;
        }

        if ((piece.getColor() == Color.WHITE && move.getTo().getRow() == 0)
                || (piece.getColor() == Color.BLACK && move.getTo().getRow() == game.getBoard().getSize() - 1)) {
            game.getBoard().setPiece(move.getTo(), pieceFactory.create(PieceType.QUEEN, piece.getColor()));
        }
    }
}
