
#[starknet::interface]
trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
}

#[starknet::contract]
mod CounterContract {
    use OwnableComponent::InternalTrait;
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address};
    use openzeppelin_access::ownable::OwnableComponent;
    
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl InternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CounterChanged: CounterChanged,
        #[flat] // Flatten the OwnableComponent::Event into the Event enum
        OwnableEvent: OwnableComponent::Event,
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
        #[substorage(v0)] // OwnableComponent::Storage is a substorage managed by the OwnableComponent
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
        self.counter.write(init_value);
        self.ownable.initializer(owner);
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

        fn set_counter(ref self: ContractState, new_value: u32) {
            self.ownable.assert_only_owner();
            let old_counter = self.counter.read();
            self.counter.write(new_value);
            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: old_counter,
                new_value: new_value,
                reason: ChangeReason::Set,
            };
            self.emit(event)
        }

    }
}
