# OCNFT POC

https://rinkeby.etherscan.io/address/0x121A808ce25e1B6Cecd1C116022b058e5dcE32bf

```shell
yarn compile
yarn test
yarn deploy_rinkeby
yarn verify_rinkeby
...
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat coverage



·--------------------------------|---------------------------|-------------|-----------------------------·
|      Solc version: 0.8.13      ·  Optimizer enabled: true  ·  Runs: 300  ·  Block limit: 30000000 gas  │
·································|···························|·············|······························
|  Methods                                                                                               │
·············|···················|·············|·············|·············|···············|··············
|  Contract  ·  Method           ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  clearFeature     ·          -  ·          -  ·      29768  ·            3  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  clearFeatureAll  ·      46281  ·      50281  ·      48681  ·            5  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  disableFeature   ·          -  ·          -  ·      45372  ·            3  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  enableFeature    ·      75672  ·      92772  ·      87226  ·           37  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  mint             ·     102533  ·     147933  ·     106789  ·           32  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  setBaseURI       ·          -  ·          -  ·      48813  ·            3  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  setExternalURI   ·          -  ·          -  ·      48901  ·            3  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  setFeature       ·      65421  ·      85333  ·      68542  ·           19  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  host      ·  setFeatureBatch  ·      67225  ·     105986  ·      89374  ·            7  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  remote    ·  mint             ·     102512  ·     147912  ·     110295  ·           35  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  remote    ·  setBaseURI       ·      48840  ·     117461  ·      83151  ·            2  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  remote    ·  setExternalURI   ·          -  ·          -  ·      48773  ·            1  ·          -  │
·············|···················|·············|·············|·············|···············|··············
|  Deployments                   ·                                         ·  % of limit   ·             │
·································|·············|·············|·············|···············|··············
|  host                          ·          -  ·          -  ·    3389054  ·       11.3 %  ·          -  │
·································|·············|·············|·············|···············|··············
|  remote                        ·          -  ·          -  ·    2132413  ·        7.1 %  ·          -  │
·--------------------------------|-------------|-------------|-------------|---------------|-------------·


-------------|----------|----------|----------|----------|----------------|
File         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-------------|----------|----------|----------|----------|----------------|
 contracts/  |    93.81 |    68.75 |    92.59 |    94.29 |                |
  host.sol   |     98.7 |       75 |      100 |      100 |                |
  remote.sol |       75 |     37.5 |       80 |    72.73 |... 130,131,132 |
-------------|----------|----------|----------|----------|----------------|
All files    |    93.81 |    68.75 |    92.59 |    94.29 |                |
-------------|----------|----------|----------|----------|----------------|

```