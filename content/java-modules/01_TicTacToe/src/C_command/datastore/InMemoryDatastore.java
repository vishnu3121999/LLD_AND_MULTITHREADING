package C_command.datastore;

import C_command.command.CommandInvoker;
import C_command.model.game.TicTacToeGame;

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
