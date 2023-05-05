import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmentChains, networkConfig } from '../helper-hardhat-config'

const deployFundMe: DeployFunction = async function (
   hre: HardhatRuntimeEnvironment
) {
   const { getNamedAccounts, deployments, network } = hre
   const { deploy, log } = deployments
   const { deployer } = await getNamedAccounts()
   let ethUsdPriceFeedAddress: string

   if (developmentChains.includes(network.name)) {
      const mockV3Aggregator = await deployments.get('MockV3Aggregator')
      ethUsdPriceFeedAddress = mockV3Aggregator.address
   } else {
      ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed
   }

   log('Deploying FundMe and waiting for confirmations...')

   const fundMe = await deploy('FundMe', {
      from: deployer,
      args: [ethUsdPriceFeedAddress],
      log: true,
      waitConfirmations: networkConfig[network.name]?.blockConfirmations || 0,
   })

   log(`FundMe deployed at ${fundMe.address}`)
}

deployFundMe.tags = ['all', 'fundMe']
export default deployFundMe
