import { ethers, getNamedAccounts } from 'hardhat'
import { FundMe } from '../typechain-types'

async function main() {
   const { deployer } = await getNamedAccounts()
   const fundMe: FundMe = await ethers.getContract('FundMe', deployer)

   console.log(`Got contract FundMe at ${fundMe.address}`)
   console.log('Funding...')

   const transactionResponse = await fundMe.fund({
      value: ethers.utils.parseEther('0.05'),
   })
   await transactionResponse.wait(1)

   console.log('Funded!')
}

main()
   .then(() => process.exit(0))
   .catch((error) => {
      console.error(error)
      process.exit(1)
   })
