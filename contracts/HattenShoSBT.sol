// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract HattenShoSBT is ERC721URIStorage, Ownable, AccessControl{
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    string public metadata_URI;

    constructor(address adminAddress
    ) ERC721("HattenSho Mint SBT", "HTSSBT") {

        //Role initialization
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(MINT_ROLE      , msg.sender);
        grantRole(ADMIN             , msg.sender);

        //ADMIN ROLES to dev account
        _setupRole(DEFAULT_ADMIN_ROLE, adminAddress);
        grantRole(MINT_ROLE      , adminAddress);
        grantRole(ADMIN             , adminAddress);

    }

    bytes32 public constant MINT_ROLE = keccak256("MINT_ROLE");
    bytes32 public constant ADMIN = keccak256("ADMIN");


    //metadataのURIを後からでも変更できる
    function set_metadataURI(string memory URI) public onlyRole(ADMIN) {
        metadata_URI = URI;
    }

    function get_metadataURI() public view returns (string memory URI) {
        return metadata_URI;
    }

    function externalMint(address to) external  {
        require(hasRole(MINT_ROLE, msg.sender), "Caller is not a minter");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadata_URI);
    }

    //override transefer for SBT
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256,
        uint256
    ) internal virtual override{
        require(
                from == address(0) || to == address(0),
                "This token is SBT, so this can not transfer."
            );
    }
    
    //override for SBT 
    function setApprovalForAll(address, bool) public virtual override {
        require(false, "This token is SBT, so this can not approve.");
    }

    //burn for public
    function burn(uint256 tokenId) public {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return
            super.supportsInterface(interfaceId) || //from ERC721URIStorage
            AccessControl.supportsInterface(interfaceId);
    }

}