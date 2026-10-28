const path = require('path')
const { fileURLToPath } = require('url')
const dotenv = require('dotenv')

dotenv.config({ path: `.env.${process.env.APP_ENV || 'dev'}` })

const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    API_URL: process.env.BASE_URL,
  },

  basePath: process.env.BASE_PATH,
  assetPrefix: process.env.ASSET_PREFIX,
}

module.exports = nextConfig
