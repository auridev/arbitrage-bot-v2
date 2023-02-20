const _ethers = require("ethers")
const _Big = require('big.js')
const _IUniswapV2Pair = require("@uniswap/v2-core/build/IUniswapV2Pair.json")

const getPairAddress = async (V2Factory, token0, token1) => {
    const pairAddress = await V2Factory.getPair(token0, token1)
    return pairAddress
}

const getPairContract = async (V2Factory, token0, token1, provider) => {
    const pairAddress = await getPairAddress(V2Factory, token0, token1)
    const pairContract = new _ethers.Contract(pairAddress, _IUniswapV2Pair.abi, provider)
    return pairContract
}

const getReserves = async (pairContract) => {
    const reserves = await pairContract.getReserves()
    return [reserves.reserve0, reserves.reserve1]
}

const calculatePrice = async (pairContract) => {
    const [x, y] = await getReserves(pairContract)
    return _Big(x).div(_Big(y))
}

const calculateDifference = async (uPrice, sPrice) => {
    return (((uPrice - sPrice) / sPrice) * 100).toFixed(2)
}

const pickArbitrageAmount = (amount1, amount2) => {
    if(_Big(amount1).lt(_Big(amount2))){
        return amount1;
    }
    return amount2;
}

const estimateMainTokenProfit = async (
    token0_amount_required_to_buy_token1_on_dex_to_buy, 
    routerPath, 
    token0, 
    token1
) => {

    const dexToBuy_Router = routerPath[0];
    const dexToSell_Router = routerPath[1];

    const trade1 = await dexToBuy_Router.getAmountsOut(token0_amount_required_to_buy_token1_on_dex_to_buy, [token0.address, token1.address])
    const amount_of_token0_spent_on_dex_to_buy = trade1[0]
    const amount_of_token1_received_on_dex_to_buy = trade1[1]

    const trade2 = await dexToSell_Router.getAmountsOut(amount_of_token1_received_on_dex_to_buy, [token1.address, token0.address])
    const amount_of_token0_received_on_dex_to_sell = trade2[1];

    const estimated_token0_amount_to_spend_on_dex_to_buy = Number(_ethers.utils.formatUnits(amount_of_token0_spent_on_dex_to_buy, 'ether'))
    const estimated_token0_amount_to_receive_from_dex_to_sell = Number(_ethers.utils.formatUnits(amount_of_token0_received_on_dex_to_sell, 'ether'))

    return estimated_token0_amount_to_receive_from_dex_to_sell - estimated_token0_amount_to_spend_on_dex_to_buy
}

module.exports = {
    getPairAddress,
    getPairContract,
    getReserves,
    calculatePrice,
    calculateDifference,
    estimateMainTokenProfit,
    pickArbitrageAmount
}