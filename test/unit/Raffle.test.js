const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../hardhat-helper-config")

const chainId = network.config.chainId
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, VRFCoordinatorV2Mock, deployer, entranceFee

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              entranceFee = networkConfig[chainId]["entranceFee"]
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })

          describe("Constructor", async function () {
              it("intializes the raffle", async function () {
                  const raffleState = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("Enter Raffle", async function () {
              it("reverts when you dont pay enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__SendMoreToEnterRaffle()"
                  )
              })
              it("records player when they enter", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  const player = await raffle.getPlayer(0)
                  assert.equal(player, deployer)
              })
          })
      })
