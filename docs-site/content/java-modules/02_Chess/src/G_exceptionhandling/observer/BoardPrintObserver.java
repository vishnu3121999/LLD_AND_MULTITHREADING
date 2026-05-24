package G_exceptionhandling.observer;

import G_exceptionhandling.model.Move;
import G_exceptionhandling.service.ChessGame;

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



