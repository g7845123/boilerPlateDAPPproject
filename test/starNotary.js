//import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

let instance;
let accounts;

contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
});

it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    assert.equal(await instance.starsForSale.call(starId), starPrice)
});

it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)
    assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), balanceOfUser1AfterTransaction.toNumber());
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)
    assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
});

// 1) The token name and token symbol are added properly.
it('token name and symbol added', async() => {
    assert.equal(await instance.name.call(), 'Udacity Star Notary');
    assert.equal(await instance.symbol.call(), 'USN');
});

// 2) 2 users can exchange their stars.
it('users can exchange their stars', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 6;
    let starId2 = 7;
    await instance.createStar('star 1', starId1, {from: user1});
    await instance.createStar('star 2', starId2, {from: user2});
    // User1 initiated exchanging star1 for star2
    // No exchange expected because user2 doesn't have exchange intention, but user1's intention is recorded
    await instance.exchangeStars(starId1, starId2, {from: user1});
    assert.equal(await instance.ownerOf.call(starId1), user1);
    assert.equal(await instance.ownerOf.call(starId2), user2);
    // User2 initiated exchanging star2 for star1
    // Exchanging successful because user1's exchange intention was recorded
    await instance.exchangeStars(starId2, starId1, {from: user2});
    assert.equal(await instance.ownerOf.call(starId1), user2);
    assert.equal(await instance.ownerOf.call(starId2), user1);
    // User2 can't exchange star2 back, because exchange intention was reset after successful exchange
    await instance.exchangeStars(starId1, starId2, {from: user2});
    assert.equal(await instance.ownerOf.call(starId1), user2);
    assert.equal(await instance.ownerOf.call(starId2), user1);
});

// 3) Stars Tokens can be transferred from one address to another.
it('star tokens can be transferred', async() => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 8;
    await instance.createStar('star 1', starId, {from: user1});
    await instance.transferStar(user2, starId, {from: user1});
    assert.equal(await instance.ownerOf.call(starId), user2);
});
