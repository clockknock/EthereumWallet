### Ethereum Wallet for Rinkeby
Simple but workful wallet for Rinkeby testnet. Welcome to start.
base on web3js+React.js. Good example for beginer. 

#### Quick Start

create a `config.js` at `src` dir, and fill `etherscanAK `   and  `infuraApiKey`, then `npm run start`

```js
let etherscanAK = "you EtherScan ApiKey";
let infuraApiKey = "your Infura ApiKey";

module.exports={etherscanAK,infuraApiKey};
```
ps: after install,change code under `node_modules/truffle-hdwallet-provider/index.js`,`truffle-hdwallet-provider/index.js`:

```js
var hdkey = require('ethereumjs-wallet/hdkey');
```

to

```js
var hdkey = require('ethereumjs-wallet/dist/hdkey');
```



you can see the this demo run at:http://193.112.157.22:3000/



main methods on `/src/App.js`, please google how to get EtherScan's and Infura's ApiKey .