package F_ConcurrencyV2.observer;

import F_ConcurrencyV2.model.game.TicTacToeGame;

public interface GameObserver {
    void onGameUpdated(String event, TicTacToeGame game);
}

