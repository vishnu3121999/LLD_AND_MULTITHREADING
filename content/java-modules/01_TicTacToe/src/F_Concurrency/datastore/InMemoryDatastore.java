package F_Concurrency.datastore;

import F_Concurrency.command.CommandInvoker;
import F_Concurrency.model.game.TicTacToeGame;

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
}
