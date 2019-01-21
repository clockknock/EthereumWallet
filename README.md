### 简单的钱包练习项目



[README for english at here.](./README_EN.md)



Rinkeby测试网络的非节点简单钱包.github地址:https://github.com/clockknock/wallet ,欢迎start
基于web3js+React.js的以太坊Rinkeby测试网络钱包,基本功能齐全,简单易懂有注释,适合初学者学习. 

#### Quick Start

在src目录下生成config.js,填入以下内容,就可以`npm run start` 开始了

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


代码跑起来后的样子可见:http://193.112.157.22:3000/



逻辑都在`/src/App.js`,EtherScan和infura的ApiKey 请查阅 [EtherScan](https://etherscan.io/apis) 和 [Infura](https://infura.io/) 获取.