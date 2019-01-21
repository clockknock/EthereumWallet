require("./App.css");
let {etherscanAK, infuraApiKey} = require("./config");
let React = require("react");
let Web3 = require('web3');
let bip39 = require('bip39');
let QrCode = require('qrcode');
let HdWalletProvider = require("truffle-hdwallet-provider");


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mnemonic: "",
            account: "",
            accounts: [],
            privateKey: "",
            restoreFromPrivateKey: "",
            transferTo: "",
            transferMsg: "",
            transHash: "0xc9e1aaeec4ab460fd5b3f8021a5d797b6f7e7a216bb9c134afbb2d00aae35440",
            transactionInfo: "",
            balance: 0,
            transValue: 0,
            transInfo: [],
            web3: {}
        }
    }

    componentDidMount() {
        //查看localStorage是否存在,如果有则直接恢复
        let mnemonic = localStorage.getItem("mnemonic");
        if (mnemonic) {
            this.initWeb3(mnemonic);
        }
    }

    initWeb3 = (mnemonic) => {
        let provider = new HdWalletProvider(mnemonic, infuraApiKey);
        let web3 = new Web3(provider);
        web3.eth.getAccounts().then(accounts => {
            //获取当前钱包成功后,将一些需要的属性放入state
            this.setState({web3, mnemonic, accounts, account: accounts[0]});
            //获取钱包后,查询一下余额
            this.getBalance();
            //获取钱包后,通过当前钱包公钥生成二维码
            this.generatePublicKeyQrCode(accounts[0]);
        })
    };

    generateMnemonic = () => {
        //通过bip39生成助记词
        let mnemonic = bip39.generateMnemonic();
        //先移除localStorage保存的助记词,再存入
        localStorage.removeItem("mnemonic");
        localStorage.setItem("mnemonic", mnemonic);
        this.setState({mnemonic});
    };

    //通过textarea填入的助记词重新生成web3对象
    generatePubAndPrivFromMnemonic = async () => {
        this.initWeb3(this.state.mnemonic);
        //先移除localStorage保存的助记词,再存入
        localStorage.removeItem("mnemonic");
        localStorage.setItem("mnemonic", this.state.mnemonic);
    };

    //生成二维码的方法
    generatePublicKeyQrCode = (msg) => {
        let canvas = document.getElementById("publicKeyQrCode");
        QrCode.toCanvas(canvas, msg, function (error) {
            if (error) console.error(error);
            console.log('二维码生成成功!');
        })
    };

    //转账交易
    transferTo = async () => {
        let {web3, account, transValue, transferTo, transferMsg} = this.state;
        let hexMsg = Buffer.from(transferMsg, "utf-8").toString("hex");
        console.log(hexMsg);
        alert("转账开始,等待确认/start transfer, waiting confirm");
        let receipt = await web3.eth.sendTransaction({
            from: account,
            to: transferTo,
            value: transValue,
            gas: '100000',
            data: hexMsg
        });
        alert("转账成功,交易hash是/transfer success, trans hash is:" + receipt.transactionHash);
        //转账后重新获取一下余额
        this.getBalance();
        console.table(receipt);
    };

    getBalance = () => {
        let {account} = this.state;
        //使用etherScan 的 api 获取钱包余额
        let getBalanceApi = `https://api-rinkeby.etherscan.io/api?module=account&action=balance&address=${account}&tag=latest&apikey=${etherscanAK}`;
        fetch(getBalanceApi)
            .then(res => {
                return res.json();
            })
            .then(res => {
                this.setState({balance: res.result})
            })
    };

    //获取当前钱包的历史交易
    getTransactionInformation = () => {
        let {account} = this.state;
        let transInfosApi = `https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanAK}`;
        fetch(transInfosApi)
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res.result);
                this.setState({transInfo: res.result.reverse()})
            })
    };

    //从私钥恢复钱包
    restoreAccountFromPrivateKey = async () => {
        //从state获取web3对象和privateKey
        let {web3, privateKey} = this.state;
        try {
            let account = {};
            //根据开始字符串判断,如果是0x开头的,直接恢复,如果不是,则手动添加再恢复
            if (privateKey.startsWith("0x")) {
                account = web3.eth.accounts.privateKeyToAccount(privateKey);
            } else {
                account = web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
            }
            console.log(account);
            this.setState({restoreFromPrivateKey: account})
        } catch (e) {
            alert("恢复钱包出错,请重试!");
            console.log(e);
        }
    };

    getTransFromHash = async (e) => {
        let {web3, transHash} = this.state;
        let transaction = await web3.eth.getTransaction(transHash);
        // let block =await web3.eth.getBlock(2936613);
        // console.table(block);
        this.setState({transactionInfo: transaction})
    };


    //各个dom的值受控
    onPrivKeyInputChange = (e) => {
        this.setState({privateKey: e.target.value})
    };

    onMnemonicTextareaChange = (e) => {
        this.setState({mnemonic: e.target.value})
    };
    onTransferToChange = (e) => {
        this.setState({transferTo: e.target.value})
    };
    onTransferValueChange = (e) => {
        this.setState({transValue: e.target.value})
    };
    onGetTransHashChange = (e) => {
        this.setState({transHash: e.target.value})
    };
    onTransferMsgChange = (e) => {
        this.setState({transferMsg: e.target.value})
    };

    render() {
        let transTd = this.state.transInfo.map((trans, index) => {
            return (
                <tr key={index}>
                    <td>{trans.hash}</td>
                    <td>{trans.timeStamp}</td>
                    <td>{new Date(parseInt(trans.timeStamp, 10) * 1000).toLocaleString()}</td>
                    <td>{trans.value}</td>
                </tr>
            )
        });

        let transInfo = [];
        for (let prop in this.state.transactionInfo) {
            let tr = (
                <tr key={prop}>
                    <td>{prop}</td>
                    <td>{this.state.transactionInfo[prop]}</td>
                </tr>
            );
            transInfo.push(tr);
        }


        return (
            <div className="App">
                <br/>
                <br/>
                <h1>Rinkeby测试网络钱包/Rinkeby Testnet Wallet</h1>

                <input type="button" value={"点击获取助记词/Click To Generate Mnemonic"} onClick={this.generateMnemonic}/>
                <br/>
                <input type="button" value={"根据助记词生成帐号(同时生成web3对象)/generate Pubkey And Privkey From Mnemonic"}
                       onClick={this.generatePubAndPrivFromMnemonic}/>
                <br/>
                <textarea cols="30" rows="10" onChange={this.onMnemonicTextareaChange}
                          placeholder={"有助记词?输入助记词/input your mnemonic if you have one"}
                          value={this.state.mnemonic}/>
                <br/>
                <h2>你的公钥/your pubkey:</h2>
                <textarea value={this.state.account} placeholder={"你的公钥/your pubkey"} disabled="true"/>
                <br/>
                <canvas id={"publicKeyQrCode"}/>
                <hr/>

                <div>
                    <h2>从私钥恢复account/recover account from privkey</h2>
                    <textarea placeholder={"请输入备份好的私钥/input your privkey"} onChange={this.onPrivKeyInputChange}/>
                    <br/>
                    <input type="button" value={"开始恢复/start recorver"} onClick={this.restoreAccountFromPrivateKey}/>
                    <p>恢复出来的帐号:recovered account</p>
                    <textarea value={this.state.restoreFromPrivateKey.address} placeholder={"恢复出来的帐号/recovered account"}
                              disabled="true"/>
                </div>
                <hr/>

                <div>
                    <h2>查看余额/get balance</h2>
                    <p>
                        <input type="button" value="查看余额/get balance" onClick={this.getBalance}/>
                    </p>
                    <p>{this.state.balance}Wei</p>
                </div>
                <hr/>

                <div>
                    <h2>转账/transfer</h2>
                    to:<textarea value={this.state.transferTo} onChange={this.onTransferToChange}/><br/>
                    value:<input type="number" value={this.state.transValue}
                                 onChange={this.onTransferValueChange}/>wei<br/>
                    msg:<textarea value={this.state.transferMsg} onChange={this.onTransferMsgChange}/><br/>
                    <input type="button" value={"执行转账/transfer"} onClick={this.transferTo}/>
                </div>
                <div>
                    <h2>获取历史交易/get history transactions</h2>
                    <input type="button" value={"获取历史交易/get history transactions"}
                           onClick={this.getTransactionInformation}/>
                    <table>
                        <thead>
                        <tr>
                            <td>txHash</td>
                            <td>timeStamp</td>
                            <td>date</td>
                            <td>value</td>
                        </tr>
                        </thead>
                        <tbody>
                        {transTd}
                        </tbody>
                    </table>
                </div>
                <hr/>

                <div>
                    <h2>其他相关方法/other method</h2>
                    <hr/>
                    <h4>根据trans hash获取交易信息/get transaction info from trans hash</h4>
                    <textarea value={this.state.transHash} onChange={this.onGetTransHashChange}/>
                    <br/>
                    <input type="button" value={"查询/query"} onClick={this.getTransFromHash}/>
                    <br/><br/>
                    <table>
                        <tbody>
                        <tr>
                            <td>key</td>
                            <td>value</td>
                        </tr>
                        {transInfo}
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }
}

export default App;
