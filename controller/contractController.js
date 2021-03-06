// File : controller/ContractController.js -->

// ContractController controller
function ContractController(app) {
  data = {};
  tomodel = {};
  // model 	= {};
  crypto = require('crypto');
  model = require('../model/user_model')
  async = require('async')
  transaction_model = require('../model/transaction_model')
  
}
var Tx = require('ethereumjs-tx');
var fs = require('fs')
var web3 = require('../config/web3')
ethController = new require('../controller/ethController')

ContractController.prototype.index = function(req, res, next) {
  // return res.json(web3.isConnected())

  var walletObj =  JSON.parse(fs.readFileSync('../config/wallet.json', 'utf8'));
  var myContract = new web3.eth.Contract(walletObj, '0xde2eeb9618062028dfe2d7eeef781d1d71b8a87d', {
    from: '0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1', // default from address
    gasPrice: '20000000000' // default gas price in wei, 20 gwei in this case
  });

  // {from: '0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1',to:'0x213A85d570e3580b18A079602e3fFdD541C6C651',value:99000}
  // myContract.methods.transfer().call()
  myContract.methods.transfer("0x213A85d570e3580b18A079602e3fFdD541C6C651", 90000).call({
      from: '0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1'
    })
    .then(function(receipt) {
      console.log(1, receipt)
      return res.json(receipt)
      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
    }).catch(function(err) {
      console.log(err)
      return res.json(err)
    });

  // var trans = myContract.methods.transfer("0x213A85d570e3580b18A079602e3fFdD541C6C651",90000).call()
  // console.log(9479845,trans)

  return
  web3.eth.call({
    to: '0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1',
    data: myContract.methods.balanceOf("0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1").encodeABI()
  }).then(balance => {
    console.log(151, balance)
  }).catch(err1 => {
    console.log(33, err1)
  })

  var bal = myContract.methods.balanceOf("0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1").call();
  console.log('bal' + bal)



  myContract.methods.balanceOf("0x3c1fdbEDbC1905D4C53980A535Aa3ff2F0ff40B1").call()
    .then(function(receipt) {
      console.log(1, receipt)
      return res.json(receipt)
      // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
    }).catch(function(err) {
      console.log(0, err)
      return res.json(err)
    });


  return

}


ContractController.prototype.trans_token = async function(req, res, next) {
  try {
  console.log(`web3 version: ${web3.version}`)

  myAddress = req.headers['eth_address']
  myId = req.headers['user_id']
  destAddress = req.body.eth_address;
  contractAddress = process.env.BNP_ETH_CONTRACT_ADDR;

  transferAmount = (req.body.amount!==undefined) ? req.body.amount : 1000;
  web3.eth.defaultAccount = myAddress;

  
  count = await web3.eth.getTransactionCount(web3.eth.defaultAccount);
  

  console.log(`num transactions so far: ${count}`);

  /**
    * set transaction nonce to 1 if it is initial transaction for address
    */
   count = (count === 0) ? 1 : count

  var abiArray = JSON.parse(fs.readFileSync('./config/wallet.json', 'utf8'));

  var contract = new web3.eth.Contract(abiArray, contractAddress, {
    from: myAddress
  });



  // How many tokens do I have before sending?
    var balanceBefore = await contract.methods.balanceOf(myAddress).call();
    console.log(`Balance before send: ${balanceBefore} ,${financialMfil(balanceBefore)} MFIL\n------------------------`);

    /**
     * unlock account for 260ms
     */
    if(count == 1){
      
    }
    await ethController.unlockAccount(req,res,next)  

    await web3.eth.sendTransaction({
      from: myAddress,
      to: contractAddress,
      value: "0x0",
      data: contract.methods.transfer(destAddress, transferAmount).encodeABI()
      //value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
    })
    .then((receipt) =>{
      console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`)

                        global.io.emit('receive_token_'+destAddress,{status:1,eth_balance: amount});
                        global.io.emit('sender_token_'+myAddress,{status:1,eth_balance: amount});


                        tomodel.sender_address = myAddress
                        tomodel.recr_address = destAddress
                        tomodel.sender_id = myId
                        tomodel.amount = req.body.amount
                        tomodel.transaction_hash = receipt.transactionHash
                        tomodel.tx_type = 3
                        saveUserTransaction(tomodel, res, next)
    }).catch((err) =>{
      console.log('send trans err: ' + err)
      global.io.emit('sender_token_'+myAddress,{status:0,eth_balance: amount});
    })


    return false
    


    /**
     * @deprecated code start here
     */

  // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
  // Use Gwei for the unit of gas price
  var gasPriceGwei = '5';
  var gasLimit = 100000;
  // Chain ID of RinkeBy Test Net is 4, replace it to 1 for Main Net
  var chainId = 4;

  var rawTransaction = {
    nonce: web3.utils.toHex(count),
    gasPrice: web3.utils.toHex(gasPriceGwei * 1e9),
    gasLimit: web3.utils.toHex(gasLimit),                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
    to: contractAddress,
    from: myAddress,
    value: "0x0",//web3.utils.toHex(web3.utils.toWei('0.84487', 'ether')),
    data: contract.methods.transfer(destAddress, transferAmount).encodeABI(),
    chainId: chainId
  }

  console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);

  let private_key_str = req.headers['eth_private_key']                                                                                                
  req.headers['eth_private_key'] = private_key_str.replace('0x', '');

  // The private key for myAddress in .env
  var privKey = new Buffer(req.headers['eth_private_key'], 'hex');
  var tx = new Tx(rawTransaction);
  tx.sign(privKey);
  var serializedTx = tx.serialize();

  // Comment out these four lines if you don't really want to send the TX right now
  console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                      .then((receipt) =>{
                        console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`)

                        global.io.emit('receive_token_'+destAddress,{status:1,eth_balance: amount});
                        global.io.emit('sender_token_'+myAddress,{status:1,eth_balance: amount});


                        tomodel.sender_address = myAddress
                        tomodel.recr_address = destAddress
                        tomodel.sender_id = myId
                        tomodel.amount = req.body.amount
                        tomodel.transaction_hash = receipt.transactionHash
                        tomodel.tx_type = 3
                        saveUserTransaction(tomodel, res, next)

                        // return res.json({
                        //   status: 1,
                        //   message: ' Token send ',
                        //   tx_count: count,
                        //   desti_addr: destAddress,
                        //   rawTx: rawTransaction,
                        //   // balancebefore: balanceBefore,
                        //   // balanceafter: balanceAfter,
                        //   signTx: serializedTx.toString('hex'),
                        //   tx_receipt: receipt
                        // })
                      } )
                      .catch((err) => {
                        console.log('send trans err: ' + err)
                        global.io.emit('sender_token_'+myAddress,{status:0,eth_balance: amount});
                        // return res.status(500).json({
                        //   status: 0,
                        //   message: 'problam in signed transaction'
                        // })
                      });
  // The receipt info of transaction, Uncomment for debug
  // console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);
  // The balance may not be updated yet, but let's check
  balanceAfter = await contract.methods.balanceOf(myAddress).call();
  console.log(`Balance after send: ${balanceAfter} , ${financialMfil(balanceAfter)} MFIL`);

  return false

  /**
    * @deprecated code end here
    */

}catch(error){
  console.log(error)
  global.io.emit('sender_token_'+myAddress,{status:0,eth_balance: amount});

    // return res.status(500).json({
    //   status: 0,
    //   message: 'problam in sending balan'
    // })
} 

};


saveUserTransaction = function(tomodel, res, next) {
  transaction_model.saveUserTransaction(tomodel, (err, doc) => {
    if (err) { // can send error check to websocket
      
      return res.status(500).json({
        status: 0,
        message: 'problam in saving transaction details',
        error: err
      })
    }
  })

  return
}




function financialMfil(numMfil) {
  return Number.parseFloat(numMfil / 1e3).toFixed(3);
}


  ContractController.prototype.getTokenBalance = async (req, res, next) =>{
    if(!req.headers['user_id']){
      return res.status(400).json({
        status: 0,
        message: 'user details not found'
      })
    }
    tomodel._id = req.headers['user_id']
    tomodel.user_eth_address = req.headers['eth_address']
    
    if(req.headers['eth_address']!=""){
      try{

      var abiArray = JSON.parse(fs.readFileSync('./config/wallet.json', 'utf8'));
      var contract = new web3.eth.Contract(abiArray, process.env.BNP_ETH_CONTRACT_ADDR, {
        from: process.env.BNP_ETH_MY_ADDR
      })




      balance = parseInt(await contract.methods.balanceOf(tomodel.user_eth_address).call())
      console.log(balance)
      return res.status(200).json({
        status: 1,
        message: 'user token balance',
        token: parseInt(balance),
        bal1:parseInt(balance)
      })
    }catch(err){
      console.log(err)
      return res.status(500).json({
        status: 0,
        message: 'problam in getting token balance'
      })
    }

    }else{
      return res.json({
        status: 1,
        message: 'user token balance',
        token: 0
      })
    }
    
    

    return 
  }


  ContractController.prototype.isAddress = async (req, res, next) =>{

    if(!req.body.eth_address){
      return res.status(400).json({
        status: 0,
        message: 'eth address is required'
      })
    }else if(req.body.eth_address === req.headers['eth_address']){
      return res.status(402).json({
        status: 0,
        message: 'cant send eth to self address'
      })
    }

    address = req.body.eth_address
    
    
    checkAddress = await web3.utils.isAddress(address)
    console.log(checkAddress)
    if(checkAddress){
      next()
    }else{
      return res.status(401).json({
        status: 0,
        message: 'Address is invalid'
      })
    }
    
  }

  ContractController.prototype.checkEthBalance = async (req, res, next) =>{
    
        let myAddress = req.headers['eth_address']
        let balance = await web3.eth.getBalance(myAddress)
        let AddressBalanceWei = parseInt(web3.utils.toWei(balance, 'ether'))
        
        if(AddressBalanceWei == 0){
          return res.status(400).json({
            'status': 0,
            'message': 'Insufficient Balance'
          }) 
        }else{
          next()
        }
        return false
  } 

  ContractController.prototype.checkTokenBalance = async (req,res, next) =>{

    myAddress = req.headers['eth_address']
    amount = parseInt(req.body.amount)
    contractAddress = process.env.BNP_ETH_CONTRACT_ADDR;
    var abiArray = JSON.parse(fs.readFileSync('./config/wallet.json', 'utf8'));

    var contract = new web3.eth.Contract(abiArray, contractAddress, {
      from: myAddress
    });
  
    // How many tokens do I have before sending?
      var addRessBalance = parseInt(await contract.methods.balanceOf(myAddress).call());
    // AddressBalanceWei = parseInt(web3.utils.toWei(balance, 'ether'))

    // AmountWei = parseInt(web3.utils.toWei(amount, 'ether'))

    console.log(addRessBalance,amount )

    if(addRessBalance < amount){
      return res.status(400).json({
        'status': 0,
        'message': 'Insufficient Tokens'
      })
      
    }else{
      // 
      // ethController.unlockAccount(req, res, next)
      ContractController.prototype.trans_token(req, res, next)
      return res.status(200).json({
        status: 1,
        message: ' transaction initiated'
      })
      // next()
    }

  }


  ContractController.prototype.faucet_token = async (socket,user_data) =>{
    
    try {
      console.log(`web3 version: ${web3.version}`)
    
      myAddress = process.env.BNP_ETH_MY_ADDR
      destAddress = user_data.eth_address;
      contractAddress = process.env.BNP_ETH_CONTRACT_ADDR;
    
      transferAmount = 1000;
      web3.eth.defaultAccount = myAddress;
    
    
      count = await web3.eth.getTransactionCount(myAddress);
      console.log(`num transactions so far: ${count}`);
    
      var abiArray = JSON.parse(fs.readFileSync('./config/wallet.json', 'utf8'));
    
      var contract = new web3.eth.Contract(abiArray, contractAddress, {
        from: myAddress
      });
    
    
    
      // How many tokens do I have before sending?
        var balanceBefore = await contract.methods.balanceOf(myAddress).call();
        console.log(`Balance before send: ${balanceBefore} ,${financialMfil(balanceBefore)} MFIL\n------------------------`);
    
    
      // I chose gas price and gas limit based on what ethereum wallet was recommending for a similar transaction. You may need to change the gas price!
      // Use Gwei for the unit of gas price
      var gasPriceGwei = '5';
      var gasLimit = 100000;
      // Chain ID of RinkeBy Test Net is 4, replace it to 1 for Main Net
      var chainId = 4;
    
      var rawTransaction = {
        nonce: web3.utils.toHex(count),
        gasPrice: web3.utils.toHex(gasPriceGwei * 1e9),
        gasLimit: web3.utils.toHex(gasLimit),
        to: contractAddress,
        from: myAddress,
        value: "0x0",//web3.utils.toHex(web3.utils.toWei('0.84487', 'ether')),
        data: contract.methods.transfer(destAddress, transferAmount).encodeABI(),
        chainId: chainId
      }
    
      console.log(`Raw of Transaction: \n${JSON.stringify(rawTransaction, null, '\t')}\n------------------------`);
    
    
      // The private key for myAddress in .env
      var privKey = new Buffer(process.env.BNP_PRIVATE_KEY, 'hex');
      var tx = new Tx(rawTransaction);
      tx.sign(privKey);
      var serializedTx = tx.serialize();
    
      // Comment out these four lines if you don't really want to send the TX right now
      console.log(`Attempting to send signed tx:  ${serializedTx.toString('hex')}\n------------------------`);
        await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                          .then((receipt) =>{
                            console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`)
    
                            if(receipt.status == '0x0'){
                              data = {status: 0}
                              socket.emit("complete_faucet_"+user_data.access_token,data);
                            }else{
                              updateFaucet(socket,user_data.email,user_data.access_token)
                              data = {status: 1}
                            }

                          } )
                          .catch((err) => {
                            console.log('send trans err: ' + err)
                            data = {status: 0}
                            socket.emit("complete_faucet_"+user_data.access_token,data);
                          });
      // The receipt info of transaction, Uncomment for debug
      // console.log(`Receipt info: \n${JSON.stringify(receipt, null, '\t')}\n------------------------`);
      // The balance may not be updated yet, but let's check
      balanceAfter = await contract.methods.balanceOf(myAddress).call();
      console.log(`Balance after send: ${balanceAfter} , ${financialMfil(balanceAfter)} MFIL`);
    
    
    
    }catch(error){
      console.log(error)
      data = {status: 0}
      socket.emit("complete_faucet_"+user_data.access_token,data);
    } 


    
    

  }


  updateFaucet = (socket,email,token) => {
    model.updateFaucet(email, (err, doc) =>{
      console.log(err, doc)
      if(err){  
        data = {status: 0}
        
      }else{
        data = {status: 1}
      }
      socket.emit("complete_faucet_"+token,data);
    })
  }







module.exports = new ContractController();