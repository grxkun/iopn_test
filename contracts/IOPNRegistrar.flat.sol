// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC721/ERC721.sol)

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC721/IERC721.sol)

// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

interface IERC721Metadata is IERC721 {
    
interface IERC721Receiver {
    
interface IERC20Errors {
    
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// OpenZeppelin Contracts (last updated v5.4.0) (utils/Strings.sol)

// OpenZeppelin Contracts (last updated v5.3.0) (utils/math/Math.sol)

// OpenZeppelin Contracts (last updated v5.1.0) (utils/Panic.sol)

library SafeCast {
    
library SignedMath {
    
abstract contract ERC165 is IERC165 {
    /// @inheritdoc IERC165
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * IOPN Registrar using OpenZeppelin ERC721.
 * - register(name) mints a token whose id = uint256(keccak256(name)) to msg.sender
 * - owner may transfer tokens using standard ERC721 functions
 */
contract IOPNRegistrar is ERC721, Ownable {
    mapping(bytes32 => uint256) public nameHashToTokenId;
    mapping(uint256 => string) public tokenIdToName;
    uint256 public registrationFeeWei;
    address public constant REVENUE_RECIPIENT = 0xfae8aec6ddb980d3268d4429b272d86a784c9584;

    constructor(string memory name_, string memory symbol_, uint256 _registrationFeeWei) ERC721(name_, symbol_) Ownable(msg.sender) {
        registrationFeeWei = _registrationFeeWei;
    }

    function _isValidName(string calldata name) internal pure returns (bool) {
        bytes memory b = bytes(name);
        if (b.length < 3 || b.length > 32) return false;
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            if (char >= 0x61 && char <= 0x7a) continue; // a-z
            if (char >= 0x30 && char <= 0x39) continue; // 0-9
            return false;
        }
        return true;
    }

    function register(string calldata name) external payable returns (uint256) {
        require(bytes(name).length > 0, "empty name");
        require(_isValidName(name), "invalid name");
        require(msg.value >= registrationFeeWei, "insufficient fee");

        bytes32 nh = keccak256(abi.encodePacked(name));
        require(nameHashToTokenId[nh] == 0, "name taken");
        uint256 tokenId = uint256(nh);
        if (tokenId == 0) tokenId = 1;
        nameHashToTokenId[nh] = tokenId;
        tokenIdToName[tokenId] = name;
        _safeMint(msg.sender, tokenId);

        // Send registration fee directly to revenue recipient
        (bool sent, ) = REVENUE_RECIPIENT.call{ value: registrationFeeWei }("");
        require(sent, "fee transfer failed");

        uint256 excess = msg.value - registrationFeeWei;
        if (excess > 0) {
            (bool refundSent, ) = msg.sender.call{ value: excess }("");
            require(refundSent, "refund failed");
        }
        return tokenId;
    }

    function nameToTokenId(string calldata name) external view returns (uint256) {
        return nameHashToTokenId[keccak256(abi.encodePacked(name))];
    }

    // owner can withdraw collected fees
    function withdraw(address to) external onlyOwner {
        payable(to).transfer(address(this).balance);
    }
}
