import { ethers, network } from 'hardhat'
import { expect } from 'chai'
import { developmentChains } from '../../helper-hardhat-config'
import { FundMe } from '../../typechain-types'

!developmentChains.includes(network.name) &&
   describe('FundMe', function () {
      let fundMe: FundMe

      beforeEach(async function () {
         const signers = await ethers.getSigners()
         const deployer = signers[0]
         fundMe = await ethers.getContract('FundMe', deployer.address)
      })

      it('Allows people to fund and withdraw ether', async function () {
         const value = ethers.utils.parseEther('0.05')

         const fundTxResponse = await fundMe.fund({ value })
         await fundTxResponse.wait(1)
         const withdrawTxResponse = await fundMe.withdraw()
         await withdrawTxResponse.wait(1)

         const endingContractBalance = await ethers.provider.getBalance(
            fundMe.address
         )

         expect(endingContractBalance.toString()).to.equal('0')
      })
   })
