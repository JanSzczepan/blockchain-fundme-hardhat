import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmentChains } from '../helper-hardhat-config'

const DECIMALS = '18'
const INITIAL_PRICE = '2000000000000000000000'

const deployMocks: DeployFunction = async function (
   hre: HardhatRuntimeEnvironment
) {
   const { deployments, getNamedAccounts, network } = hre
   const { deployer } = await getNamedAccounts()
   const { deploy, log } = deployments

   if (developmentChains.includes(network.name)) {
      log('Local network detected! Deploying mocks...')

      await deploy('MockV3Aggregator', {
         contract: 'MockV3Aggregator',
         from: deployer,
         args: [DECIMALS, INITIAL_PRICE],
         log: true,
      })

      log('Mocks deployed!')
   }
}

deployMocks.tags = ['all', 'mocks']
export default deployMocks
