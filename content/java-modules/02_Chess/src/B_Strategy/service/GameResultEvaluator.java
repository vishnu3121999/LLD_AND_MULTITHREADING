package B_Strategy.service;

import B_Strategy.board.ChessBoard;
import B_Strategy.model.GameState;
import B_Strategy.model.Move;
import B_Strategy.model.Piece;
import B_Strategy.model.PieceType;
import B_Strategy.model.Position;

public class GameResultEvaluator {
    public void evaluate(ChessGame game, Move lastMove) {
        ChessBoard board = game.getBoard();
        int pieceCount = 0;
        int kingCount = 0;

        for (int row = 0; row < board.getSize(); row++) {
            for (int col = 0; col < board.getSize(); col++) {
                Piece piece = board.getPiece(Position.of(row, col));
                if (piece == null) {
                    continue;
                }
                pieceCount++;
                if (piece.getType() == PieceType.KING) {
                    kingCount++;
                }
            }
        }

        if (kingCount < 2) {
            game.setGameState(GameState.WON);
            game.setWinner(lastMove.getPlayer());
            return;
        }

        if (pieceCount == 2) {
            game.setGameState(GameState.DRAW);
            game.setWinner(null);
            return;
        }

        game.setGameState(GameState.IN_PROGRESS);
        game.setWinner(null);
    }
}
