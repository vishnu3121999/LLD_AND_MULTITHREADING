# Approach Comparison

## Existing Packages

`A_basic` demonstrates ATM cash balance, accounts, cards, balance check, withdraw, deposit, and transaction records.

## A_basic Design Analysis

### Requirements

#### System Specific Requirements

Physical structure:
- An ATM has location and cash balance.
- A card maps to an account.
- An account has balance.
- Transactions record user operations.

Action based points:
- Admin adds ATMs, accounts, and cards.
- User checks balance, withdraws, and deposits.
- System authenticates card and updates ATM/account balances.

Misc:
- A_basic assumes correct PIN and sufficient balances.
- Cash denomination, invalid PIN, limits, receipts, and bank network errors are deferred.

#### Common Misc

Offline or online:
- ATM is device-like but uses facade/datastore for consistency.

Extensibility:
- Transaction processing, bank integration, and cash dispenser behavior are future extensions.

History and undo:
- Transaction records provide history; undo is not needed.

Notifications:
- SMS/email alerts are deferred.

Exception handling:
- Invalid card/PIN and insufficient balance are later validations.

Concurrency:
- Concurrent withdrawals are deferred.

### UseCase Diagram

Actors:
- User
- Admin
- System

UseCases:
- addATM/addAccount/addCard(Admin)
- checkBalance(User) -> authenticate(System) -> read Account(System)
- withdraw(User) -> authenticate(System) -> debit Account(System) -> dispense ATM cash(System) -> create Transaction(System)
- deposit(User) -> authenticate(System) -> credit Account(System) -> accept ATM cash(System) -> create Transaction(System)

### Class Diagram

Core entities:
- `ATM(atmId, location, cashBalance)` owns ATM cash state.
- `Account(accountId, balance)` owns account balance.
- `Card(cardId, accountId, pin)` links card to account.
- `Transaction(transactionId, accountId, transactionType, amount, transactionStatus)` records operations.

Method placement:
- User workflows belong in the facade because they coordinate card, account, ATM, and transaction.
- `debit/credit` belong in `Account` and `dispense/acceptCash` belong in `ATM` because they mutate only local state.
