package E_Observer.memento;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

public class GameCaretaker {
    private final Map<String, Deque<GameMemento>> historyByGameId = new HashMap<>();

    public void save(String gameId, GameMemento memento) {
        historyByGameId.computeIfAbsent(gameId, ignored -> new ArrayDeque<>()).push(memento);
    }

    public GameMemento undo(String gameId) {
        Deque<GameMemento> history = historyByGameId.get(gameId);
        if (history == null || history.isEmpty()) {
            return null;
        }
        return history.pop();
    }
}

