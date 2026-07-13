package C_command.datastore;

import C_command.command.CommandInvoker;
import C_command.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}
