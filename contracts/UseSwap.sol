// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "./interfaces/IUniswapV2Routeri.sol";
import "./interfaces/IUniswapV2Routeri.sol";
import "./interfaces/IERC20.sol";

contract UseSwap {

    address public uniswapRouter;
    address public owner;
    uint public swapCount;

    constructor(address _uniswapRouter) {
        uniswapRouter = _uniswapRouter;
        owner = msg.sender;
    }

    function handleSwap(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external {

        IERC20(path[0]).transferFrom(msg.sender, address(this), amountInMax);

        require(IERC20(path[0]).approve(uniswapRouter, amountInMax), "approve failed.");
        
        IUniswapV2Router02(uniswapRouter).swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );

        swapCount += 1;
    }


    function handleAddLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external {

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);

        require(IERC20(tokenA).approve(uniswapRouter, amountADesired), "approve failed.");
        require(IERC20(tokenB).approve(uniswapRouter, amountBDesired), "approve failed.");

        IUniswapV2Router02(uniswapRouter).addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            to,
            deadline
        );

        swapCount += 1;
    }
}