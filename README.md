###简单的钱包练习项目

基于web3js+React.js的以太坊钱包,基本功能齐全,简单易懂有注释,适合初学者学习. 

####Quick Start

在src目录下生成config.js,填入以下内容,就可以`npm run start` 开始了

```js
let etherscanAK = "you EtherScan ApiKey";
let infuraApiKey = "your Infura ApiKey";

module.exports={etherscanAK,infuraApiKey};
```
ps:install结束后,因为ethereumjs-wallet的hdkey换了位置,`truffle-hdwallet-provider/index.js`中,第二行中的:

```
var hdkey = require('ethereumjs-wallet/hdkey');
```

需要改为

```
var hdkey = require('ethereumjs-wallet/dist/hdkey');
```



代码跑起来后的样子可见:http://193.112.157.22:3000/



逻辑都在`/src/App.js`,EtherScan和infura的ApiKey如何获取请自己Google. 