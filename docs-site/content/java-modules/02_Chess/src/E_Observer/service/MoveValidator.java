package E_Observer.service;

import E_Observer.board.ChessBoard;
import E_Observer.factory.MovementStrategyFactory;
import E_Observer.model.Color;
import E_Observer.model.Move;
import E_Observer.model.Piece;
import E_Observer.movement.MovementStrategy;

public class MoveValidator {
    private final MovementStrategyFactory movementStrategyFactory;

    public MoveValidator(MovementStrategyFactory movementStrategyFactory) {
        this.movementStrategyFactory = movementStrategyFactory;
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
        MovementStrategy strategy = movementStrategyFactory.getStrategy(movingPiece.getType());
        return strategy.canMove(board, movingPiece, move);
    }
}

