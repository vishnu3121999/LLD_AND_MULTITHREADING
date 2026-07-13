package D_Observer.datastore;

import D_Observer.command.CommandInvoker;
import D_Observer.model.game.TicTacToeGame;

public interface IDatastore {
    TicTacToeGame getGame();
    CommandInvoker getCommandInvoker();
}
