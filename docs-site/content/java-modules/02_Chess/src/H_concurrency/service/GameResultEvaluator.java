package H_concurrency.service;

import H_concurrency.board.ChessBoard;
import H_concurrency.model.GameState;
import H_concurrency.model.Move;
import H_concurrency.model.Piece;
import H_concurrency.model.PieceType;
import H_concurrency.model.Position;

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




