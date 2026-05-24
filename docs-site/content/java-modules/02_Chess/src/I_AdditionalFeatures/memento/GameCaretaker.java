package I_AdditionalFeatures.memento;

import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

public class GameCaretaker {
    private final Map<String, Deque<GameMemento>> historyByGameId = new ConcurrentHashMap<>();

    public void save(String gameId, GameMemento memento) {
        historyByGameId.computeIfAbsent(gameId, ignored -> new ConcurrentLinkedDeque<>()).push(memento);
    }

    public GameMemento undo(String gameId) {
        Deque<GameMemento> history = historyByGameId.get(gameId);
        if (history == null || history.isEmpty()) {
            return null;
        }
        return history.pop();
    }
}





