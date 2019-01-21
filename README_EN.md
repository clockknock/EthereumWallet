### Ethereum Wallet for Rinkeby
Simple but workful wallet for Ethereum. Welcome to start.
base on web3js+React.js. Good example for beginer. 

#### Quick Start

create a `config.js` at `src` dir, and fill `etherscanAK `   and  `infuraApiKey`, then `npm run start`

```js
module.exports={etherscanAK,infuraApiKey};

let Config={
    rinkeby:{
        etherscanAK:"you EtherScan ApiKey",
        infuraApiKey:"your Infura ApiKey",
        etherscanBaseUrl:"api-rinkeby.etherscan.io"
    },
    mainnet:{
        etherscanAK:"you EtherScan ApiKey",
        infuraApiKey:"your Infura ApiKey",
        etherscanBaseUrl:"api.etherscan.io"
    }
};

module.exports=Config;
```


you can see the this demo run at:http://193.112.157.22:3000/



 methods are at `/src/App.js`, please check these website to get [EtherScan's](https://etherscan.io/apis) and [Infura's](https://infura.io/) ApiKey.