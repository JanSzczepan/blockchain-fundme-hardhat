type NetworkConfigInfoItem = {
   ethUsdPriceFeed: string
   blockConfirmations?: number
}

type NetworkConfigInfo = {
   [item: string]: NetworkConfigInfoItem
}

export const networkConfig: NetworkConfigInfo = {
   sepolia: {
      ethUsdPriceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
      blockConfirmations: 6,
   },
}

export const developmentChains: string[] = ['localhost', 'hardhat']
