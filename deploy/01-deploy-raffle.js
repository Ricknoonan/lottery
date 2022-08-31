const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../hardhat-helper-config")
const { verify } = require("../utils/verify")

const VRF_SUB_FUND_AMT = ethers.utils.parseEther("30")
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    let vrfCoordinatorV2Address
    let chainId = network.config.chainId
    let subcriptionId
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2 = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2.address
        const transactionResponse = await vrfCoordinatorV2.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subcriptionId = transactionReceipt.events[0].args.subId
        await vrfCoordinatorV2.fundSubscription(subcriptionId, VRF_SUB_FUND_AMT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinator"]
        subcriptionId = networkConfig[chainId]["subId"]
    }
    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const interval = networkConfig[chainId]["interval"]
    const callbackGasLimit = networkConfig[chainId]["callBackGasLimit"]

    const args = [
        vrfCoordinatorV2Address,
        subcriptionId,
        gasLane,
        interval,
        entranceFee,
        callbackGasLimit,
    ]
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args)
    }

    log("----------------------")
}

module.exports.tags = ["all", "mocks"]
