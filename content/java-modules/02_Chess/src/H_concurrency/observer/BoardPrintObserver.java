package H_concurrency.observer;

import H_concurrency.model.Move;
import H_concurrency.service.ChessGame;

public class BoardPrintObserver implements GameObserver {
    @Override
    public void onGameStarted(String gameId, ChessGame game) {
        game.getBoard().print();
    }

    @Override
    public void onMoveCompleted(String gameId, Move move, ChessGame game) {
        game.getBoard().print();
    }

    @Override
    public void onMoveUndone(String gameId, ChessGame game) {
        game.getBoard().print();
    }
}




