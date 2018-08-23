require("./App.css")    ;
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
    generatePubAndPriv = async () => {
        this.initWeb3(this.state.mnemonic);
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
        let {web3, account, transValue, transferTo} = this.state;
        let receipt = await  web3.eth.sendTransaction({
            from: account,
            to: transferTo,
            value: transValue,
            gas: '1000000'
        });
        alert("转账成功,交易hash是:" + receipt.transactionHash);
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
    getTransactionInfomations = () => {
        let {account} = this.state;
        let transInfosApi = `https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanAK}`;
        fetch(transInfosApi)
            .then(res => {
                return res.json();
            })
            .then(res => {
                console.log(res.result);
                this.setState({transInfo: res.result})
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

    render() {
        let transTd = this.state.transInfo.map((trans, index) => {
            return (
                <tr key={index}>
                    <td>{trans.hash}</td>
                    <td>{trans.timeStamp}</td>
                    <td>{trans.value}</td>
                </tr>
            )
        });

        return (
            <div className="App">
                <br/>
                <br/>

                <input type="button" value={"点击获取助记词"} onClick={this.generateMnemonic}/>
                <br/>
                <input type="button" value={"根据助记词生成帐号"} onClick={this.generatePubAndPriv}/>
                <br/>
                <textarea cols="30" rows="10" onChange={this.onMnemonicTextareaChange} placeholder={"有助记词?输入助记词"}
                          value={this.state.mnemonic}/>
                <br/>
                <p>你的公钥:</p>
                <textarea value={this.state.account} placeholder={"你的公钥"} disabled="true"/>
                <br/>
                <canvas id={"publicKeyQrCode"}/>
                <hr/>

                <div>
                    <p>从私钥恢复account</p>
                    <textarea placeholder={"请输入备份好的私钥"} onChange={this.onPrivKeyInputChange}/>
                    <br/>
                    <input type="button" value={"开始恢复"} onClick={this.restoreAccountFromPrivateKey}/>
                    <p>恢复出来的帐号:</p>
                    <textarea value={this.state.restoreFromPrivateKey.address} placeholder={"恢复出来的帐号"} disabled="true"/>
                </div>
                <hr/>

                <div>
                    <p>
                        <input type="button" value="查看余额" onClick={this.getBalance}/>
                    </p>
                    <p>{this.state.balance}Wei</p>
                </div>
                <hr/>

                <div>
                    <p>转账</p>
                    to:<textarea value={this.state.transferTo} onChange={this.onTransferToChange}/><br/>
                    value:<input type="number" value={this.state.transValue}
                                 onChange={this.onTransferValueChange}/><br/>
                    <input type="button" value={"执行转账"} onClick={this.transferTo}/>
                </div>
                <div>
                    <p>获取历史交易</p>
                    <input type="button" value={"获取历史交易"} onClick={this.getTransactionInfomations}/>
                    <table>
                        <thead>
                        <tr>
                            <td>txHash</td>
                            <td>timeStamp</td>
                            <td>value</td>
                        </tr>
                        </thead>
                        <tbody>
                        {transTd}
                        </tbody>
                    </table>
                </div>
                <hr/>
            </div>
        );
    }
}

export default App;
