require('dotenv').config({path:__dirname+'/.env.local'})
// const { env } = require('process');
const { NEXT_PUBLIC_ALCHEMY_API_ENDPOINT, NEXT_PUBLIC_ACCOUNT_SECRET_KEY } = process.env;

import '@nomiclabs/hardhat-waffle';



// eslint-disable-next-line no-undef


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

export const networks = {
  goerli: {
    url: `${NEXT_PUBLIC_ALCHEMY_API_ENDPOINT}`,
    accounts: [`${NEXT_PUBLIC_ACCOUNT_SECRET_KEY}`],
  },
};
export const solidity = '0.8.4';

