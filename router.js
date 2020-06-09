const Web3 = require('web3');
const Router = require('@koa/router')
const config = require('./config.json');




const web3 = new Web3(process.env.INFURA_URL);

web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const adminAddress = web3.eth.accounts.wallet[0];

const router = new Router();

const cTokens = {
	cBat: new web3.eth.Contract(
		config.cTokenAbi,
		config.cBatAddress),
	cDai: new web3.eth.Contract(
		config.cTokenAbi,
		config.cDaiAddress)
};

router.get('/tokenBalance/:cToken/:address', async ctx =>{
	const cToken = cTokens[ctx.params.cToken];
	if(typeof cToken === 'undefined'){
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} does not exist`
		};
		return;
	} 

	try{
	const tokenBalance = await cToken 
	.methods
	.balanceOfUnderlying(ctx.params.address)
	.call();
  ctx.body = {
  	cToken:ctx.params.cToken,
  	address:ctx.params.address,
  	tokenBalance
  };
} catch(e) {
	console.log(e);
	ctx.status = 500;
	ctx.body = {
		error: 'Internal Server Error'
	}
}

});

router.get('/ctokenBalance/:cToken/:address', async ctx =>{
	const cToken = cTokens[ctx.params.cToken];
	if(typeof cToken === 'undefined'){
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} does not exist`
		};
		return;
	} 

	try{
	const cTokenBalance = await cToken 
	.methods
	.balanceOf(ctx.params.address)
	.call();
  ctx.body = {
  	cToken:ctx.params.cToken,
  	address:ctx.params.address,
  	cTokenBalance
  };
} catch(e) {
	console.log(e);
	ctx.status = 500;
	ctx.body = {
		error: 'Internal Server Error'
	}
}

});


router.post('/mint/:cToken/:amount', async ctx =>{
	const cToken = cTokens[ctx.params.cToken];
	if(typeof cToken === 'undefined'){
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} does not exist`
		};
		return;
	}

	const tokenAddress = await cToken 
	.methods
	.underlying()
	.call()

	const token = new web3.eth.Contract(
		config.ERC20Abi,
		tokenAddress 
		);

	await token
	.methods
	.approve(cToken.options.address,ctx.params.amount)
	.send({from:adminAddress});


	try{
	await cToken 
	.methods
	.mint(ctx.params.amount)
	.send({from:adminAddress});
  ctx.body = {
  	cToken:ctx.params.cToken,
  	address:adminAddress,
  	amountMinted:ctx.params.amount
  };
} catch(e) {
	console.log(e);
	ctx.status = 500;
	ctx.body = {
		error: 'Internal Server Error'
	}
}

});

router.post('/redeem/:cToken/:amount', async ctx =>{
	const cToken = cTokens[ctx.params.cToken];
	if(typeof cToken === 'undefined'){
		ctx.status = 400;
		ctx.body = {
			error: `cToken ${ctx.params.cToken} does not exist`
		};
		return;
	}


	try{
	await cToken 
	.methods
	.redeem(ctx.params.amount)
	.send({from:adminAddress});
  ctx.body = {
  	cToken:ctx.params.cToken,
  	address:adminAddress,
  	amountRedeemed:ctx.params.amount
  };
} catch(e) {
	console.log(e);
	ctx.status = 500;
	ctx.body = {
		error: 'Internal Server Error'
	}
}

});

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", '*');
	res.header("Access-Control-Allow-Credentials", true);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
	next();
  });



module.exports = router;