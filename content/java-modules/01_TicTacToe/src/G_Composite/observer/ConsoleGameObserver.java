package G_Composite.observer;

import G_Composite.model.game.TicTacToeGame;

public class ConsoleGameObserver implements GameObserver {
    private final String name;

    public ConsoleGameObserver(String name) {
        this.name = name;
    }

    @Override
    public void onGameUpdated(String event, TicTacToeGame game) {
        String winner = game.getWinner() == null ? "none" : game.getWinner().getName();
        System.out.println("[" + name + "] " + event + " | state=" + game.getGameState() + ", winner=" + winner);
    }
}
