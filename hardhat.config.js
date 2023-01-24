const fs = require('fs');
// const { env } = require('process');

require('@nomiclabs/hardhat-waffle');

const privateKey0 = fs.readFileSync('.secret').toString().trim();

// eslint-disable-next-line no-undef
const privateKey = 'c68a26197c9c4c1b761d4fa24d0b1de43d96196685af9393a460a14a9468bc70';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// module.exports = {
//   networks: {
//     hardhat: {
//       chainId: 1337,
//     },
//   },
//   solidity: '0.8.4',
// };

module.exports = {
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/x76uPc1xwSSrSv6ATYVU3ccja_AwMh6r',
      accounts: [privateKey],
    },
  },
  solidity: '0.8.4',
};

