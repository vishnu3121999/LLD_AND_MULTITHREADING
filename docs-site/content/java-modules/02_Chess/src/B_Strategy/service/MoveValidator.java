package B_Strategy.service;

import B_Strategy.board.ChessBoard;
import B_Strategy.model.Color;
import B_Strategy.model.Move;
import B_Strategy.model.Piece;
import B_Strategy.model.PieceType;
import B_Strategy.movement.KingMovementStrategy;
import B_Strategy.movement.KnightMovementStrategy;
import B_Strategy.movement.LineMovementStrategy;
import B_Strategy.movement.MovementStrategy;
import B_Strategy.movement.PawnMovementStrategy;

public class MoveValidator {
    private final MovementStrategy kingStrategy;
    private final MovementStrategy queenStrategy;
    private final MovementStrategy rookStrategy;
    private final MovementStrategy bishopStrategy;
    private final MovementStrategy knightStrategy;
    private final MovementStrategy pawnStrategy;

    public MoveValidator() {
        this.kingStrategy = new KingMovementStrategy();
        this.queenStrategy = new LineMovementStrategy(true, true);
        this.rookStrategy = new LineMovementStrategy(true, false);
        this.bishopStrategy = new LineMovementStrategy(false, true);
        this.knightStrategy = new KnightMovementStrategy();
        this.pawnStrategy = new PawnMovementStrategy();
    }

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
        return getStrategy(movingPiece.getType()).canMove(board, movingPiece, move);
    }

    private MovementStrategy getStrategy(PieceType type) {
        switch (type) {
            case KING:
                return kingStrategy;
            case QUEEN:
                return queenStrategy;
            case ROOK:
                return rookStrategy;
            case BISHOP:
                return bishopStrategy;
            case KNIGHT:
                return knightStrategy;
            case PAWN:
                return pawnStrategy;
            default:
                throw new IllegalArgumentException("Unsupported piece type: " + type);
        }
    }
}
