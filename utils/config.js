require('dotenv').config();

module.exports = {
  baseURL: process.env.BASE_URL || 'https://dev-nx.thekanaa.com',
  localePath: process.env.LOCALE_PATH || '/en-sa/',
  user: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  },
  runFullCheckout: (process.env.RUN_FULL_CHECKOUT || 'false').toLowerCase() === 'true',
};
