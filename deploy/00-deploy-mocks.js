const { getNamedAccounts, deployments, network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../hardhat-helper-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9
const args = [BASE_FEE, GAS_PRICE_LINK]

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    log("Deployer Mocks....")
    if (developmentChains.includes(network.name)) {
        log("Local Network, deploying mocks")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks deployed!")
        log("--------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
