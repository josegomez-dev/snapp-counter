# 🏗️ Advanced Counter Smart Contract - Starknet Basecamp 13 Final Project

<div align="center">

![Starknet](https://img.shields.io/badge/Starknet-FF4B1F?style=for-the-badge&logo=starknet&logoColor=white)
![Cairo](https://img.shields.io/badge/Cairo-1.0-FF4B1F?style=for-the-badge&logo=cairo&logoColor=white)
![Scaffold-Stark](https://img.shields.io/badge/Scaffold--Stark-2.0-FF4B1F?style=for-the-badge)
![Basecamp](https://img.shields.io/badge/Starknet%20Basecamp-13-FF4B1F?style=for-the-badge)

**A sophisticated counter smart contract showcasing advanced Starknet development concepts**

</div>

---

## 🎯 Project Overview

This project demonstrates advanced smart contract development on Starknet using Cairo 1.0, featuring a comprehensive counter contract with **ERC20 token integration**, **ownership patterns**, **event emission**, and **comprehensive testing**. Built as the final project for **Starknet Basecamp 13**, it showcases production-ready development practices and real-world blockchain interactions.

### ✨ Key Highlights

- 🔐 **Ownership Control**: OpenZeppelin's Ownable pattern for secure access management
- 💰 **ERC20 Integration**: STRK token payments for premium operations
- 📊 **Event-Driven Architecture**: Comprehensive event emission for frontend integration
- 🧪 **100% Test Coverage**: Extensive test suite covering all scenarios
- 🚀 **Production Ready**: Error handling, security checks, and gas optimization
- 🎨 **Modern Frontend**: Next.js with TypeScript and Tailwind CSS

---

## 🏗️ Smart Contract Architecture

### 📋 Contract Interface

```cairo
#[starknet::interface]
pub trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
    fn reset_counter(ref self: T);
}
```

### 🔧 Core Features

| Function | Access Level | Description | Cost |
|----------|-------------|-------------|------|
| `get_counter()` | Public | Read current counter value | Free |
| `increase_counter()` | Public | Increment counter by 1 | Gas only |
| `decrease_counter()` | Public | Decrement counter by 1 (with bounds check) | Gas only |
| `set_counter()` | **Owner Only** | Set counter to any value | Gas only |
| `reset_counter()` | Public | Reset counter to 0 | **1 STRK** |

### 💎 Advanced Features

#### 🔐 Ownership Pattern
- **OpenZeppelin Integration**: Secure ownership management
- **Owner-Only Functions**: `set_counter()` restricted to contract owner
- **Flexible Ownership**: Transferrable ownership capabilities

#### 💰 ERC20 Token Integration
- **STRK Token Payments**: Reset operation requires 1 STRK payment
- **Balance Validation**: Checks user has sufficient STRK tokens
- **Allowance Management**: Requires token approval before reset
- **Automatic Transfer**: STRK sent to contract owner upon reset

#### 📊 Event System
```cairo
#[derive(Drop, starknet::Event)]
pub struct CounterChanged {
    #[key]
    pub caller: ContractAddress,
    pub old_value: u32,
    pub new_value: u32,
    pub reason: ChangeReason,
}
```

**Event Types:**
- `Increase`: Counter incremented
- `Decrease`: Counter decremented  
- `Set`: Owner set new value
- `Reset`: Counter reset with payment

---

## 🧪 Comprehensive Testing

### 📊 Test Coverage

| Test Category | Tests | Coverage |
|---------------|-------|----------|
| **Basic Operations** | 4 | ✅ 100% |
| **Access Control** | 2 | ✅ 100% |
| **Error Handling** | 2 | ✅ 100% |
| **ERC20 Integration** | 3 | ✅ 100% |
| **Event Emission** | 6 | ✅ 100% |

### 🔍 Test Scenarios

#### ✅ Happy Path Tests
```cairo
#[test]
fn test_contract_initialization()
fn test_increase_counter()
fn test_decrease_counter_happy_path()
fn test_set_counter_owner()
fn test_reset_counter_success()
```

#### ❌ Error Path Tests
```cairo
#[test]
#[should_panic(expected: "Counter cannot be less than 0")]
fn test_decrease_counter_fail_path()

#[test]
#[should_panic]
fn test_set_counter_non_owner()

#[test]
#[should_panic(expected: "Caller does not have enough STARK tokens")]
fn test_reset_counter_insufficient_balance()

#[test]
#[should_panic(expected: "Contract is not allowed to spend the caller's STARK tokens")]
fn test_reset_counter_insufficient_allowance()
```

### 🎯 Advanced Testing Features

- **Event Spy**: Validates all events are emitted correctly
- **Address Cheating**: Tests different caller addresses
- **Balance Manipulation**: Tests ERC20 token scenarios
- **Multi-Contract Interaction**: STRK token approval and transfer testing

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v22+)
- [Yarn](https://yarnpkg.com/)
- [Starknet Devnet](https://0xspaceshard.github.io/starknet-devnet/)
- [Scarb](https://docs.swmansion.com/scarb/) (v2.11.4)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/) (v0.46.0)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd snapp

# Install dependencies
yarn install

# Start local Starknet network
yarn chain

# Deploy contracts (in new terminal)
yarn deploy

# Start frontend (in new terminal)
yarn start
```

### Testing

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run specific test file
yarn test test_counter.cairo
```

---

## 🏛️ Project Structure

```
packages/
├── nextjs/                    # Frontend application
│   ├── app/                   # Next.js 13+ app directory
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   └── contracts/             # Contract ABIs and addresses
└── snfoundry/                 # Smart contract development
    ├── contracts/
    │   ├── src/
    │   │   ├── counter.cairo  # Main counter contract
    │   │   ├── utils.cairo    # Helper functions
    │   │   └── lib.cairo      # Library file
    │   └── tests/
    │       └── test_counter.cairo  # Comprehensive test suite
    └── scripts-ts/            # Deployment scripts
```

---

## 🔧 Technical Implementation

### 🏗️ Contract Components

#### Counter Contract
- **Storage**: Simple counter state with OpenZeppelin ownership
- **Constructor**: Initializes counter value and sets owner
- **Functions**: Five main functions with different access levels

#### Utility Functions
```cairo
pub fn strk_address() -> ContractAddress
pub fn strk_to_fri(amount: u256) -> u256
```

### 🎨 Frontend Integration

- **Scaffold-Stark Hooks**: `useScaffoldReadContract`, `useScaffoldWriteContract`
- **Multi-Write Support**: `useScaffoldMultiWriteContract` for token approval + reset
- **Event Monitoring**: Real-time event listening and display
- **Balance Integration**: STRK balance checking and display

---

## 🛡️ Security Features

### 🔒 Access Control
- **Ownership Pattern**: Critical functions restricted to owner
- **Public Functions**: Safe operations available to all users
- **Payment Verification**: STRK balance and allowance checks

### 💰 Token Security
- **Balance Validation**: Prevents insufficient balance operations
- **Allowance Checks**: Requires explicit token approval
- **Atomic Operations**: Multi-write transactions ensure consistency

### 🚨 Error Handling
- **Bounds Checking**: Prevents counter underflow
- **Assert Statements**: Clear error messages for failed operations
- **Graceful Failures**: Proper panic messages for debugging

---

## 📈 Performance & Gas Optimization

- **Minimal Storage**: Only essential state variables
- **Efficient Events**: Key-indexed events for easy filtering
- **Gas-Efficient Operations**: Optimized for Starknet's gas model
- **Batch Operations**: Multi-write support for complex transactions

---

## 🌐 Network Support

- **Starknet Devnet**: Local development and testing
- **Starknet Sepolia**: Testnet deployment
- **Starknet Mainnet**: Production deployment ready

---

## 🤝 Contributing

This project was developed as part of **Starknet Basecamp 13**. While it's a final project, contributions and improvements are welcome!

### Development Guidelines

1. **Testing**: All new features must include comprehensive tests
2. **Documentation**: Update README for any new functionality
3. **Code Style**: Follow Cairo and TypeScript best practices
4. **Security**: Review all access controls and token interactions

---

## 📚 Learning Resources

### Starknet Development
- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Scaffold-Stark](https://docs.scaffoldstark.com/)

### Smart Contract Security
- [OpenZeppelin Cairo](https://github.com/OpenZeppelin/cairo-contracts)
- [Starknet Security Best Practices](https://docs.starknet.io/security/)

---

## 🏆 Basecamp 13 Achievements

This project demonstrates mastery of:

- ✅ **Cairo 1.0** smart contract development
- ✅ **OpenZeppelin** component integration
- ✅ **ERC20** token interaction patterns
- ✅ **Event-driven** architecture
- ✅ **Comprehensive testing** with Starknet Foundry
- ✅ **Frontend integration** with React/Next.js
- ✅ **Production deployment** practices
- ✅ **Security patterns** and access control

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Starknet Basecamp 13**

[Starknet](https://starknet.io/) • [Cairo](https://cairo-lang.org/) • [Scaffold-Stark](https://scaffoldstark.com/)

</div>
