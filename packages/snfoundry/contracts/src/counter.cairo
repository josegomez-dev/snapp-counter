#[starknet::interface]
trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
}

#[starknet::contract]
mod CounterContract {
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address};
    
    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CounterChanged: CounterChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct CounterChanged {
        #[key]
        caller: ContractAddress,
        old_value: u32,
        new_value: u32,
        reason: ChangeReason,
    }

    #[derive(Drop, Copy, Serde)]
    enum ChangeReason {
        Increase,
        Decrease,
        Reset,
        Set
    }
    
    #[storage]
    struct Storage {
        counter: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_value: u32) {
        self.counter.write(init_value);
    }

    #[abi(embed_v0)]
    impl CounterImpl of ICounter<ContractState> {
        fn get_counter(self: @ContractState) -> u32 {
            self.counter.read()
        }
        fn increase_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            let new_counter = current_counter + 1;
            
            self.counter.write(new_counter);
            
            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Increase,
            };
            self.emit(event)
        }
        fn decrease_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            
            assert!(current_counter > 0, "Counter cannot be less than 0");
            
            let new_counter = current_counter - 1;
            self.counter.write(new_counter);

            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_counter,
                new_value: new_counter,
                reason: ChangeReason::Decrease,
            };
            self.emit(event)
        }
    }
}
