// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

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
