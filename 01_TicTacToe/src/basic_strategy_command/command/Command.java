package basic_strategy_command.command;

public interface Command {
    boolean execute();
    boolean undo();
}
