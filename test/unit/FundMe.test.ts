import { deployments, ethers, network } from 'hardhat'
import { expect } from 'chai'
import { FundMe, MockV3Aggregator } from '../../typechain-types'
import { developmentChains } from '../../helper-hardhat-config'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

describe('FundMe', function () {
   let fundMe: FundMe
   let mockV3Aggregator: MockV3Aggregator
   let deployer: SignerWithAddress

   beforeEach(async function () {
      if (!developmentChains.includes(network.name)) {
         throw 'You need to be on a development chain to run unit tests'
      }

      const accounts = await ethers.getSigners()
      deployer = accounts[0]
      await deployments.fixture(['all'])
      fundMe = await ethers.getContract('FundMe', deployer)
      mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
   })

   describe('constructor', function () {
      it('Sets the price feed address corectly', async function () {
         const priceFeed = await fundMe.s_priceFeed()
         const expectedPriceFeed = mockV3Aggregator.address
         expect(priceFeed).to.equal(expectedPriceFeed)
      })
   })

   describe('fund', function () {
      it("Fails if you don't send enough ETH", async function () {
         await expect(fundMe.fund({ value: 0 })).to.be.revertedWith(
            'You need to spend more ETH!'
         )
      })

      it('Updates the amount funded data structure', async function () {
         const value = ethers.utils.parseEther('1')
         await fundMe.fund({ value })
         const expectedValue = await fundMe.s_addressToAmountFunded(
            deployer.address
         )
         expect(expectedValue.toString()).to.equal(value.toString())
      })

      it('Adds funder to array of funders', async function () {
         const value = ethers.utils.parseEther('1')
         await fundMe.fund({ value })
         const funder = await fundMe.s_funders(0)
         expect(funder).to.equal(deployer.address)
      })
   })

   describe('withdraw', function () {
      beforeEach(async function () {
         const value = ethers.utils.parseEther('1')
         await fundMe.fund({ value })
      })

      it('Gives a single funder all their ETH back', async function () {
         const startingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
         )
         const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
         )

         const tranactionResponse = await fundMe.withdraw()
         const transactionReceipt = await tranactionResponse.wait(1)
         const { effectiveGasPrice, gasUsed } = transactionReceipt
         const gasCost = effectiveGasPrice.mul(gasUsed)

         const endingDeploerBalance = await ethers.provider.getBalance(
            deployer.address
         )
         const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
         )

         expect(endingFundMeBalance.toString()).to.equal('0')
         expect(endingDeploerBalance.add(gasCost).toString()).to.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString()
         )
      })

      it('Allows to withdraw with multiple funders', async function () {
         const signers = await ethers.getSigners()
         const value = ethers.utils.parseEther('1')

         for (let i = 1; i < 6; i++) {
            const funder = signers[i]
            const connectedToNewFunderFundMeContract = await fundMe.connect(
               funder
            )
            await connectedToNewFunderFundMeContract.fund({ value })
         }

         const startingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
         )
         const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
         )

         const tranactionResponse = await fundMe.withdraw()
         const transactionReceipt = await tranactionResponse.wait(1)
         const { effectiveGasPrice, gasUsed } = transactionReceipt
         const gasCost = effectiveGasPrice.mul(gasUsed)

         const endingDeploerBalance = await ethers.provider.getBalance(
            deployer.address
         )
         const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
         )

         expect(endingFundMeBalance.toString()).to.equal('0')
         expect(endingDeploerBalance.add(gasCost).toString()).to.equal(
            startingDeployerBalance.add(startingFundMeBalance).toString()
         )
         await expect(fundMe.s_funders(0)).to.be.reverted
         for (let i = 1; i < 6; i++) {
            expect(
               await fundMe.s_addressToAmountFunded(signers[i].address)
            ).to.equal('0')
         }
      })

      it('Only allows the owner to withdraw', async function () {
         const signers = await ethers.getSigners()
         const attacker = signers[1]
         const connectedToAttackerFundMeContract = await fundMe.connect(
            attacker
         )

         await expect(
            connectedToAttackerFundMeContract.withdraw()
         ).to.be.rejectedWith('FundMe__NotOwner')
      })
   })
})
