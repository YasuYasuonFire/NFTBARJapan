// run.js
const main = async () => {
  const ContractFactorySBT = await hre.ethers.getContractFactory("HattenShoSBT");
  const HSSBTContractdeploying = await ContractFactory.deploy("0x29259AB48215239dBE1bc1e7bFCC818EB426ad7B");//false:Goerli
  const HSSBTContract = await HSSBTContractdeploying.deployed();
  console.log("SBT Contract address: ", HSSBTContract.address);

  let tx = await HSSBTContract.set_metadataURI("https://storage.googleapis.com/hattensho/hattenshoMetaData/SBT.json") //set MetaData for SBT
  await tx.wait();

  //set SBT's MINT_ROLE to NFT contract
  const mintRole = HSSBTContract.MINT_ROLE();
  tx = await HSSBTContract.grantRole(mintRole, "0x387c0F8d409a4b51A3e7EEd20A8c9EC73D6762B8");
  await tx.wait();



  // let txn = await HSContract.setOnlyAllowlisted(false);
  // txn.wait();

  // txn = await HSContract.setPause(false);
  // txn.wait();

  // //mint
  // txn = await HSContract.mint(1,1,[],{
  //   value:ethers.utils.parseEther("0.08")
  // });
  // txn.wait();
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();