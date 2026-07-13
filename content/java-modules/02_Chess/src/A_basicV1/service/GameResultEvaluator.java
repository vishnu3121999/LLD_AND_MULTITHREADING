package A_basicV1.service;

import A_basicV1.board.ChessBoard;
import A_basicV1.model.GameState;
import A_basicV1.model.Move;
import A_basicV1.model.Position;
import A_basicV1.pieces.King;
import A_basicV1.pieces.Piece;

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
                if (piece instanceof King) {
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
