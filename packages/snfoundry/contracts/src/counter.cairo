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
        }
        fn decrease_counter(ref self: ContractState) {
            let current_counter = self.counter.read();
            assert!(current_counter > 0, "Counter cannot be less than 0");
            let new_counter = current_counter - 1;
            self.counter.write(new_counter);
        }
    }
}
