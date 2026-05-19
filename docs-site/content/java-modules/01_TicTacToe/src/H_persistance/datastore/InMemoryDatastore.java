package H_persistance.datastore;

import H_persistance.command.CommandInvoker;
import H_persistance.model.game.TicTacToeGame;

public class InMemoryDatastore implements IDatastore {
    private final TicTacToeGame game;
    private final CommandInvoker commandInvoker;

    public InMemoryDatastore(TicTacToeGame game) {
        this.game = game;
        this.commandInvoker = new CommandInvoker();
    }

    @Override
    public TicTacToeGame getGame() {
        return game;
    }

    @Override
    public CommandInvoker getCommandInvoker() {
        return commandInvoker;
    }

    @Override
    public void save() {
        // Nothing to flush for in-memory storage.
    }
}
