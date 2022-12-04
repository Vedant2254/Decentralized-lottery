// Raffle

// Enter the lottery (paying some amount)
// Pick a random winner (verifiably random)
// Winner to be selected every X minutes -> completely automated
// Chainlink Oracle -> Randomness, Automated Execution (Chainlink Keepers)

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error Raffle__NotEnoughETH();
error Raffle__TransferFailed();
error Raffle__NotOpen();
error Raffle__UpKeepNotNeeded(
  uint256 currentBalance,
  uint256 players,
  uint256 raffleState
);

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
  /* Type Declarations */
  enum RaffleState {
    OPEN,
    CALCULATING
  } // uint256 0 = OPEN, 1 = CALCULATING

  /* State variables */
  address payable[] private s_players; // array of payable addresses because any one address will be the winner and will be payed
  uint256 private immutable i_entranceFee; // immutable because set only once in constructor
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane;
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint16 private constant NUM_WORDS = 1;

  /* Lottery variables */
  address private s_recentWinner;
  RaffleState private s_raffleState;
  uint256 private s_lastTimeStamp;
  uint256 private immutable i_interval;

  /* Events - should be named in reverse order of name of function it is emitted from */
  event RaffleEnter(address indexed player);
  event RequestedRaffleWinner(uint256 indexed requestId);
  event WinnerPicked(address indexed winner);

  constructor(
    address vrfCoordinatorV2,
    uint256 entranceFee,
    bytes32 gasLane,
    uint64 subscriptionId,
    uint32 callbackGasLimit,
    uint256 interval
  ) VRFConsumerBaseV2(vrfCoordinatorV2) {
    i_entranceFee = entranceFee;
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callbackGasLimit = callbackGasLimit;
    s_raffleState = RaffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
    i_interval = interval;
  }

  function enterRaffle() public payable {
    if (s_raffleState != RaffleState.OPEN) revert Raffle__NotOpen();
    if (msg.value < i_entranceFee) revert Raffle__NotEnoughETH();

    s_players.push(payable(msg.sender));

    // Emit an event when we update a dynamic array or mapping
    emit RaffleEnter(msg.sender);
  }

  /**
   * @dev Chainlink automation calls this function and looks for `upkeepNeeded` to return true
   * The following conditions needs to be satisfied for lottery to trigger:
   * 1. Lottery interval should have passed
   * 2. The lottery should have atleast 1 player, and have some ETH
   * 3. Our subscription is funded with LINK
   * 4. The lottery should be in an "open" state
   */
  function checkUpkeep(
    bytes memory /* checkData */
  )
    public
    override
    returns (bool upkeepNeeded, bytes memory /* performData */)
  {
    bool isOpen = s_raffleState == RaffleState.OPEN;
    bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
    bool hasPlayers = s_players.length > 0;
    bool hasBalance = address(this).balance > 0;

    upkeepNeeded = isOpen && timePassed && hasPlayers && hasBalance;
  }

  // requestRandomNumber renamed to performUpKeep
  function performUpkeep(bytes calldata /* performData */) external override {
    // Request the random number
    // Once we get it, do something with it
    // 2 transaction process

    // This is to avoid someone else running the function before the interval is finished
    (bool upkeepNeeded, ) = checkUpkeep("");
    if (!upkeepNeeded)
      revert Raffle__UpKeepNotNeeded(
        address(this).balance,
        s_players.length,
        uint256(s_raffleState)
      );

    s_raffleState = RaffleState.CALCULATING;
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );
    emit RequestedRaffleWinner(requestId);
  }

  // function present as virtual in VRFConsumerBaseV2, we need to override it here
  function fulfillRandomWords(
    uint256 /* requestId */,
    uint256[] memory randomWords
  ) internal override {
    uint256 winnerIndex = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[winnerIndex];
    s_recentWinner = recentWinner;

    // Send ETH to winner
    (bool success, ) = recentWinner.call{ value: address(this).balance }("");
    if (!success) revert Raffle__TransferFailed();

    // reset values
    s_raffleState = RaffleState.OPEN;
    s_players = new address payable[](0);
    s_lastTimeStamp = block.timestamp;

    emit WinnerPicked(recentWinner);
  }

  /* View / pure functions */
  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayers(uint256 index) public view returns (address) {
    return s_players[index];
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }

  function getRaffleState() public view returns (RaffleState) {
    return s_raffleState;
  }

  // this function is pure because it is returning a constant variable
  function getNumWords() public pure returns (uint256) {
    return NUM_WORDS;
  }

  function getLatestTimeStamp() public view returns (uint256) {
    return s_lastTimeStamp;
  }

  function getRequestConfirmations() public pure returns (uint16) {
    return REQUEST_CONFIRMATIONS;
  }
}
