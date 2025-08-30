// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SubsidyLog {
    struct Entry {
        string action;
        string dataHash;
        uint256 timestamp;
    }

    Entry[] public entries;

    function addEntry(string memory action, string memory dataHash) public returns (uint256) {
        entries.push(Entry(action, dataHash, block.timestamp));
        return entries.length - 1;
    }

    function getEntries() public view returns (Entry[] memory) {
        return entries;
    }
}
