const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, assert} = require("chai");

describe("HattenSho contract", function () {
    async function deployContractFixture(){ //define common setup
        const [owner,addr1,addr2] = await ethers.getSigners();
        //SBT deploy
        const ContractFactorySBT = await ethers.getContractFactory("HattenShoSBT");
        const HSSBTContract = await ContractFactorySBT.deploy(addr1.address); //give admin role to addr1
        let tx = await HSSBTContract.set_metadataURI("https://storage.googleapis.com/hattensho/hattenshoMetaData/SBT.json") //set MetaData for SBT
        await tx.wait();

        //NFT deploy
        const SBTAddress = HSSBTContract.address;
        const ContractFactory = await ethers.getContractFactory("HattenSho");
        const HSContract = await ContractFactory.deploy(addr1.address, SBTAddress, false); //give admin role to addr1

        //set SBT's MINT_ROLE to NFT contract
        const mintRole = HSSBTContract.MINT_ROLE();
        tx = await HSSBTContract.grantRole(mintRole, HSContract.address);
        await tx.wait();

        return {HSContract, HSSBTContract, owner, addr1, addr2};
    }

  it("Check ADMIN ROLE of dev account", async function () {
    const { HSContract, owner, addr1, addr2 } = await loadFixture(deployContractFixture);

    expect(await HSContract.paused()).to.equal(true);//default:paused=true

    let tx = await HSContract.connect(addr1).setPause(false);//addr1 setpause true to False
    await tx.wait();
    expect(await HSContract.paused()).to.equal(false);


    tx = await HSContract.connect(addr1).setMintWithSBT(false);//addr1 set to false
    await tx.wait();
    expect(await HSContract.mintWithSBT()).to.equal(false);
  });
  
  it("At 2nd sale, NFTs cost change.",async function() {
    const { HSContract, owner, addr1, addr2 } = await loadFixture(deployContractFixture);

    let tx = await HSContract.connect(addr1).setPause(false);//addr1 setpause true to False
    await tx.wait();

    //1st sale , cost = 0.08ETH
    expect(await HSContract.cost()).to.equal(80000000000000000n);

    //change to 2nd sale
    tx = await HSContract.connect(addr1).changeCostOneToTwo();
    await tx.wait();
    tx = await HSContract.connect(addr1).setOnlyAllowlisted(false);
    await tx.wait();
    expect(await HSContract.cost()).to.equal(88000000000000000n);
    expect(await HSContract.onlyAllowlisted()).to.equal(false);
  });

  it("At 2nd sale, normal user can mint",async function() {
    const { HSContract, owner, addr1, addr2 } = await loadFixture(deployContractFixture);

    let tx = await HSContract.connect(addr1).setPause(false);//addr1 setpause true to False
    await tx.wait();

    //mitWithSBT:false
    tx = await HSContract.connect(addr1).setMintWithSBT(false);

    //change to 2nd sale
    tx = await HSContract.connect(addr1).changeCostOneToTwo();
    await tx.wait();
    tx = await HSContract.connect(addr1).setOnlyAllowlisted(false);
    await tx.wait();
    
    //public mint by normal user:addr2
    tx = await HSContract.connect(addr2).mint(1,1,["0x52d1c66d408c3f7b71e56cd705ede20a6430829100b1f0119bc91f0116824e5c"],{//with dummy proof
        value:ethers.utils.parseEther("0.088")
    });
    await tx.wait();
    expect(await HSContract.getUserMintedAmount(addr2.address)).to.equal(1);


    tx = await HSContract.connect(addr2).mint(1,1,["0x52d1c66d408c3f7b71e56cd705ede20a6430829100b1f0119bc91f0116824e5c"],{
        value:ethers.utils.parseEther("0.088")
    });
    await tx.wait();
    expect(await HSContract.getUserMintedAmount(addr2.address)).to.equal(2);


    tx = await HSContract.connect(addr2).mint(2,1,["0x52d1c66d408c3f7b71e56cd705ede20a6430829100b1f0119bc91f0116824e5c"],{
        value:ethers.utils.parseEther("0.176")
    });
    await tx.wait();
    expect(await HSContract.getUserMintedAmount(addr2.address)).to.equal(4);
  });

  it("At 2nd sale, user get one SBT",async function() {
    const { HSContract, HSSBTContract,  owner, addr1, addr2 } = await loadFixture(deployContractFixture);

    let tx = await HSContract.connect(addr1).setPause(false);//addr1 setpause true to False
    await tx.wait();

    //check mitWithSBT:true
    expect(await HSContract.mintWithSBT()).to.equal(true);

    //change to 2nd sale
    tx = await HSContract.connect(addr1).changeCostOneToTwo();
    await tx.wait();
    tx = await HSContract.connect(addr1).setOnlyAllowlisted(false);
    await tx.wait();
    
    //public mint by normal user:addr2
    tx = await HSContract.connect(addr2).mint(1,1,["0x52d1c66d408c3f7b71e56cd705ede20a6430829100b1f0119bc91f0116824e5c"],{//with dummy proof
        value:ethers.utils.parseEther("0.088")
    });
    await tx.wait();
    expect(await HSContract.getUserMintedAmount(addr2.address)).to.equal(1);
    //check SBT of user:addr2
    expect(await HSSBTContract.balanceOf(addr2.address)).to.equal(1);


    //public mint by normal user:addr2 (buy one more)
    tx = await HSContract.connect(addr2).mint(1,1,["0x52d1c66d408c3f7b71e56cd705ede20a6430829100b1f0119bc91f0116824e5c"],{//with dummy proof
        value:ethers.utils.parseEther("0.088")
    });
    await tx.wait();
    expect(await HSContract.getUserMintedAmount(addr2.address)).to.equal(2);

    //check SBT of user:addr2. user can get only one SBT
    expect(await HSSBTContract.balanceOf(addr2.address)).to.equal(1);

});


})