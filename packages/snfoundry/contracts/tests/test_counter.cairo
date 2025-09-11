use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, spy_events, start_cheat_caller_address, stop_cheat_caller_address, set_balance, Token};
use contracts::counter::{ICounterDispatcher, ICounterDispatcherTrait};
use snforge_std::EventSpyAssertionsTrait;
use contracts::counter::CounterContract::{CounterChanged, ChangeReason, Event};
use contracts::utils::{strk_address, strk_to_fri};
use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

fn owner_address() -> ContractAddress {
    'owner'.try_into().unwrap()
}

fn user_address() -> ContractAddress {
    'user'.try_into().unwrap()
}

fn deploy_counter(init_counter: u32) -> ICounterDispatcher {
    let owner_address: ContractAddress = owner_address();

    let contract = declare("CounterContract").unwrap().contract_class();
 
    let mut constructor_args = array![];
    init_counter.serialize(ref constructor_args);
    owner_address.serialize(ref constructor_args);

    let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
    ICounterDispatcher{ contract_address }
}

#[test]
fn test_contract_initialization() {
    let dispatcher = deploy_counter(5);
    let current_counter = dispatcher.get_counter();
    let expected_counter: u32 = 5;
    assert!(current_counter == expected_counter, "Counter is not initialized correctly");
}

#[test]
fn test_increase_counter() {
    let init_counter: u32 = 0;
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events(); // Spy on events
    
    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.increase_counter();
    stop_cheat_caller_address(dispatcher.contract_address);

    let current_counter = dispatcher.get_counter();

    assert!(current_counter == 1, "Counter is not increased correctly");

    let expected_event = CounterChanged {
        caller: user_address(),
        old_value: 0, // init_counter
        new_value: 1,
        reason: ChangeReason::Increase,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event),
    )])
}

#[test]
fn test_decrease_counter_happy_path() {
    let init_counter: u32 = 6;
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events(); // Spy on events

    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.decrease_counter();
    stop_cheat_caller_address(dispatcher.contract_address);

    let current_counter = dispatcher.get_counter();

    assert!(current_counter == 5, "Counter is not decreased correctly");

    let expected_event = CounterChanged {
        caller: user_address(),
        old_value: 6, // init_counter
        new_value: 5,
        reason: ChangeReason::Decrease,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event),
    )])
}

#[test]
#[should_panic(expected: "Counter cannot be less than 0")]
fn test_decrease_counter_fail_path() {
    let init_counter: u32 = 0;
    let dispatcher = deploy_counter(init_counter);

    dispatcher.decrease_counter();
    dispatcher.get_counter();
}

#[test]
fn test_set_counter_owner() {
    let init_counter: u32 = 8;
    let dispatcher = deploy_counter(init_counter);
    let mut spy = spy_events();

    let new_counter: u32 = 15;
    start_cheat_caller_address(dispatcher.contract_address, owner_address());
    dispatcher.set_counter(new_counter);
    stop_cheat_caller_address(dispatcher.contract_address);

    let current_counter = dispatcher.get_counter();

    assert!(current_counter == new_counter, "Counter is not set correctly");

    let expected_event = CounterChanged {
        caller: owner_address(),
        old_value: init_counter,
        new_value: new_counter,
        reason: ChangeReason::Set,
    };

    spy.assert_emitted(@array![(
        dispatcher.contract_address,
        Event::CounterChanged(expected_event),
    )])
}

#[test]
#[should_panic]
fn test_set_counter_non_owner() {
    let init_counter: u32 = 8;
    let dispatcher = deploy_counter(init_counter);

    let new_counter: u32 = 15;
    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.set_counter(new_counter);
    stop_cheat_caller_address(dispatcher.contract_address);
}

#[test]
#[should_panic(expected: "Caller does not have enough STARK tokens to reset the counter")]
fn test_reset_counter_unsufficient_balance() {
    let init_counter: u32 = 8;
    let dispatcher = deploy_counter(init_counter);

    start_cheat_caller_address(dispatcher.contract_address, user_address());
    dispatcher.reset_counter();
}

#[test]
#[should_panic(expected: "Contract is not allowed to spend the caller's STARK tokens")]
fn test_reset_counter_unsufficient_allowance() {
    let init_counter: u32 = 8;
    let dispatcher = deploy_counter(init_counter);

    let caller = user_address();
    
    set_balance(caller, strk_to_fri(1), Token::STRK);

    start_cheat_caller_address(dispatcher.contract_address, caller);
    dispatcher.reset_counter();
}

#[test]
fn test_reset_counter_success() {
    let init_counter: u32 = 8;
    let counter = deploy_counter(init_counter);
    let mut spy = spy_events();
    
    let user = user_address();

    set_balance(user, strk_to_fri(10), Token::STRK);
    let erc_20 = IERC20Dispatcher { contract_address: strk_address() };
    
    start_cheat_caller_address(erc_20.contract_address, user);
    erc_20.approve(counter.contract_address, strk_to_fri(5));
    stop_cheat_caller_address(erc_20.contract_address);

    start_cheat_caller_address(counter.contract_address, user);
    counter.reset_counter();
    stop_cheat_caller_address(counter.contract_address);

    assert!(counter.get_counter() == 0, "Counter is not reset correctly");

    let expected_event = CounterChanged {
        caller: user,
        old_value: init_counter,
        new_value: 0,
        reason: ChangeReason::Reset,
    };

    spy.assert_emitted(@array![(
        counter.contract_address,
        Event::CounterChanged(expected_event),
    )]);

    assert!(erc_20.balance_of(user) == strk_to_fri(9), "Balance is not deducted correctly");
    assert!(erc_20.balance_of(owner_address()) == strk_to_fri(1), "Balance is not increased correctly");
}