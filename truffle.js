// Use dotenv node module to save private information in an environment variable
require('dotenv').config()
// Allows us to use ES6 in our migrations and tests.
require('babel-register')

// Edit truffle.config file should have settings to deploy the contract to the Rinkeby Public Network.
// Infura should be used in the truffle.config file for deployment to Rinkeby.

const HDWalletProvider = require('truffle-hdwallet-provider');
module.exports = {
    networks: {
        ganache: {
            host: '127.0.0.1',
            port: 7545,
            network_id: '*' // Match any network id
        }, 
        rinkeby: {
            provider: () => new HDWalletProvider(
                process.env.WALLET_MNEMONIC, 
                process.env.WEB3_PROVIDER
            ),
            network_id: '4',
            gas: 4500000,
            confirmations: 2,
            gasPrice: 10000000000,
        },
    }
}
