package F_Concurrency.observer;

import F_Concurrency.model.game.TicTacToeGame;

public interface GameObserver {
    void onGameUpdated(String event, TicTacToeGame game);
}
