import { ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
   const { deployer } = await getNamedAccounts()
   const fundMe: FundMe = await ethers.getContract('FundMe', deployer)

   console.log(`Got contract FundMe at ${fundMe.address}`)
   console.log('Withdrawing...')

   const transactionResponse = await fundMe.withdraw()
   await transactionResponse.wait(1)

   console.log('Got it back!')
}

main()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error)
      process.exit(1)
   })
