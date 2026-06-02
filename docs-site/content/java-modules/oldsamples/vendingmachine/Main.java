//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {
        // Happy Flow :  select -> pay -> collect
        // Happy Flow :  select -> cancel
        // Happy Flow :  cancel
        // Unsupported Flow :  select -> pay -> cancel   (cancelling not allowed after payment )

        // Unhappy flows are difficult to simulate. Need to create multiple threads for diff req to simulate the exception behaviour
        // Unhappy flow1 : pay
        // Unhappy flow1 : select -> pay -> pay
        // Unhappy flow1 : select -> pay -> select
        // Unhappy flow1 : select -> select
    }
}