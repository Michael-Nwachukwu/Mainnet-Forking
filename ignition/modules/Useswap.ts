import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const UNISWAPV2ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const UseSwapModule = buildModule("UseSwapModule", (m) => {
  const uniswapRouter = m.getParameter("_uniswapRouter", UNISWAPV2ROUTER);

  const swapContract = m.contract("UseSwap", [uniswapRouter]);

  return { swapContract };
});

export default UseSwapModule;
