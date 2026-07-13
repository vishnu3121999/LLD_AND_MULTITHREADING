package F_COR.observer;

import F_COR.model.Move;
import F_COR.service.ChessGame;

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


