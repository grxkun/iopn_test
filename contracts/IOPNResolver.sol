// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./IOPNRegistrar.sol";

/**
 * Simple resolver that maps tokenId -> address and a text record.
 * Only the owner (as reported by the registrar) may set records for their token.
 */
contract IOPNResolver {
    IOPNRegistrar public registrar;

    mapping(uint256 => address) public addr;
    mapping(uint256 => string) public textRecord;

    constructor(address registrarAddress) {
        registrar = IOPNRegistrar(registrarAddress);
    }

    modifier onlyOwner(uint256 tokenId) {
        require(registrar.ownerOf(tokenId) == msg.sender, "not owner");
        _;
    }

    function setAddress(uint256 tokenId, address newAddr) external onlyOwner(tokenId) {
        addr[tokenId] = newAddr;
    }

    function setText(uint256 tokenId, string calldata value) external onlyOwner(tokenId) {
        textRecord[tokenId] = value;
    }

    function resolveAddress(string calldata name) external view returns (address) {
        uint256 tokenId = registrar.nameToTokenId(name);
        return addr[tokenId];
    }

    function resolveText(string calldata name) external view returns (string memory) {
        uint256 tokenId = registrar.nameToTokenId(name);
        return textRecord[tokenId];
    }
}
