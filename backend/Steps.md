# Developing backend

## Creating contracts

### Raffle.sol

#### New concept, Events in solidity

<iframe width="560" height="315" src="https://www.youtube.com/embed/KDYJC85eS5M" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

1. EVM writes logs in a specific data-structure when something happens on a blockchain. **Events** and **Logs** are often called synonymously.

2. Events allow us to print stuff to this log data-structure. Writing to this data-structure is much gas-efficient than writing it to a storage variable.

3. These logs are not accessible to the smart contracts, still we can print some information that is important. Each of these events are tied to the smart contracts that emitted this event.

4. In short, events are just like global variables of a contract, but because storing them into a storage variable uses a lot of gas, we can store them into EVM logs using events. Events can be listened, so that we can perform some action when an event occurs.

5. Chainlink nodes make use of these events to listen to the requests like a request for a random number or an API call.

6. Sometimes there are toooo many events. This makes searching for an event difficult. [The Graph](https://thegraph.com/) indexes these events so that they can be easily queried later on.

7. We use `event` type of declare an event. It can be declare like so

    ```
    event storedNumber (
        uint256 indexed oldNumber,
        uint256 indexed newNumber,
        uint256 addedNumber,
        address sender
    )
    ```

    There are two types of parameters to the events, indexed and non-indexed parameters. `indexed` keyword is used to declare indexed parameters. These are much easier to search for than the non-indexed parameters. Non-indexed parameters are embedded directly into contract abi. If you have abi they are easy to decode, else they are hard to decode.

8. This is how event is emitted

```
    emit storedFavNum(
        favNum,
        _favNum,
        favNum + _favNum,
        msg.sender
    );
```

#### Using Chainlink VRFv2 for getting a random number

**What all do we need?**

1. `VRFConsumerBaseV2.sol` is a base class that is inherited in our smart contract.
2. Run constructor of base class `VRFConsumerBaseV2.sol` along with our contract class to set the address of `vrfCoordinatorV2`. `vrfCoordinatorV2` is the address of the contract that will provide us the random number.
3. `VRFCoordinatorV2Interface.sol` is an interface which takes the `vrfCoordinatorV2` as a parameter, or it wraps around the contract that is used for getting a random number.
4. Inside function `requestRandomNumber()` we call the function `requestRandomWords` with required parameters to get the random number.
5. Override function `fulfillRandomWords()` to request for a random number.

#### Using Chainlink Keeper to upkeep our contract

**What all do we need to do?**

1. Make our contract chainlink keeper compatible by implementing the two functions `checkUpKeep` and `performUpKeep`.
2. Next, we need to register our smart contract on Chainlink Keeper to request to upkeep our contract.

#### Enums in smart contract

```
/* Type Declarations */
enum RaffleState {
    OPEN,
    CALCULATING
} // uint256 0 = OPEN, 1 = CALCULATING
```
