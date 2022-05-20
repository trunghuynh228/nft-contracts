// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Trend is ERC20, Pausable, AccessControl{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    mapping(address => bool) private _blackList;
    event BlacklistAdded(address account);
    event BlacklistRemoved(address account);

    constructor() ERC20("TREND","TRD") {
        _setupRole(DEFAULT_ADMIN_ROLE,msg.sender);
        _setupRole(PAUSER_ROLE,msg.sender);
        _mint(msg.sender, 1000000000 * 10 **decimals());
    }

    function pause() public onlyRole (PAUSER_ROLE) {
        _pause();
    }
    function unpause() public onlyRole (PAUSER_ROLE) {
        _unpause();
    }
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        require(_blackList[from] == false, "Account sender was on blacklist");
        require(_blackList[to] == false, "Account recipient was on blacklist");
        super._beforeTokenTransfer(from, to, amount);
    }

    function addToBlacklist(address _account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_account != msg.sender,"Trendivision: must not add sender to blacklist");
        require(_blackList[_account] == false,"Trendivision: must not add sender to blacklist");
        _blackList[_account] = true;
        emit BlacklistAdded(_account);
    }

        function removeFromBlacklist(address _account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(_blackList[_account] == true,"Trendivision: account was not on blacklist");
        _blackList[_account] = false;
        emit BlacklistRemoved(_account);
    }
}