import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("UseSwap", function () {

  async function deployUseSwap() {

    const [owner] = await hre.ethers.getSigners();
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    const UseSwap = await hre.ethers.getContractFactory("UseSwap");
    const useSwap = await UseSwap.deploy(ROUTER_ADDRESS);

    return { useSwap, owner, ROUTER_ADDRESS };
  }

  describe("Deployment", function () {

    it("Should swap", async function () {

      // grab the deployed contract and router address
      const { useSwap, ROUTER_ADDRESS } = await loadFixture(deployUseSwap);

      // usdc contract
      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      // Dai contract
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      // Token holder conract
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      // Impersonate the holder address
      await helpers.impersonateAccount(TOKEN_HOLDER);
      // Make holder a signer to be able to sign transactions
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

      // define amount out (amount desired to be swapped)
      const amountOut = ethers.parseUnits("20", 18);
      // define the amountInmax (max amount of token that should be sent, this checkmates slippage)
      const amountInMax = ethers.parseUnits("1000", 6);

      // grab the usdc contract
      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
      // grab the dai contract 
      const DAI_Contract = await ethers.getContractAt("IERC20", DAI);

      // define a deadline
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

      // approve our contract to spend the amount of usdc
      await USDC_Contract.approve(useSwap, amountInMax);

      // perform the actual swap in our contract - passing in the parameters. This function calls the actual uniswa pfunction in our interface
      const tx = await useSwap.connect(impersonatedSigner).handleSwap(amountOut, amountInMax, [USDC, DAI], impersonatedSigner.address, deadline);

      tx.wait();

      // approve again for second tx
      await USDC_Contract.approve(useSwap, amountInMax);
      
      // second transaction
      const tx1 = await useSwap.connect(impersonatedSigner).handleSwap(amountOut, amountInMax, [USDC, DAI], impersonatedSigner.address, deadline);

      // wait for tx
      tx1.wait();

      expect(await useSwap.uniswapRouter()).to.equal(ROUTER_ADDRESS);
      expect(await useSwap.swapCount()).to.equal(2);

    });

    it("Should add liquidity", async function () {

      // grab the deployed contract and router address
      const { useSwap, ROUTER_ADDRESS } = await loadFixture(deployUseSwap);

      // usdc contract
      const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      // Dai contract
      const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
      const USDC_DAI_PAIR = "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5";
      // Token holder conract
      const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

      // Impersonate the holder address
      await helpers.impersonateAccount(TOKEN_HOLDER);
      // Make holder a signer to be able to sign transactions
      const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

      const amountADesired = ethers.parseUnits("100", 6);
      const amountBDesired = ethers.parseUnits("100", 18);
      const amountAMinimum = ethers.parseUnits("90", 6);
      const amountBMinimum = ethers.parseUnits("90", 18);

      // grab the usdc contract
      const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
      const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
      const LP_COntracts = await ethers.getContractAt("IERC20", USDC_DAI_PAIR, impersonatedSigner); 

      // define a deadline
      const deadline = Math.floor(Date.now() / 1000) + (60 * 10);

      const ROUTER = await ethers.getContractAt("IUniswapV2Router02", ROUTER_ADDRESS, impersonatedSigner);

      // Approve spending
      await USDC_Contract.approve(useSwap, amountADesired);
      await DAI_Contract.approve(useSwap, amountBDesired);

      // Check LP token balance before the transaction
      const lpBalBefore = await LP_COntracts.balanceOf(impersonatedSigner.address);
      console.log("LP Token Balance before:", Number(lpBalBefore));

      // perform the actual swap in our contract - passing in the parameters. This function calls the actual uniswa pfunction in our interface
      const tx = await useSwap.connect(impersonatedSigner).handleAddLiquidity(
        USDC,
        DAI,
        amountADesired,
        amountBDesired,
        amountAMinimum,
        amountBMinimum,
        impersonatedSigner.address,
        deadline
      );

      tx.wait();

      expect(await useSwap.swapCount()).to.equal(1);
      expect(await LP_COntracts.balanceOf(impersonatedSigner.address)).not.to.equal(lpBalBefore);


    });
  });
});
