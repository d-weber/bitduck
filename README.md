# BitDuck
Minimal crypto portfolio tracker. Goal is to give users a ultra simple
and anonymous crypto tracker where they can track global value of their
assets with live refresh.
Every portfolio is lost after 30 days without access.
- Use Redis and CoinMarketCap API
- Use cookies for portfolio id
### Cached :
- CMC Listing `[SYMBOL => CMCID]` in CMC Lib
- Crypto prices of CMC for 10s
- Portfolios assets for 30 days (reset every access)
### Linter :
- eslintrc from **https://github.com/standard/eslint-config-standard**
- `npm run lint`
### ./config/config.json example :
````json
{
  "logLevels": [ "info", "warn", "error" ],
  "app": {
    "cores": 2,
    "port": 2051,
    "host": "127.0.0.1"
  },
  "redis": {
    "host": "127.0.0.1",
    "port": 6379,
    "database": 0,
    "prefix": "duck:"
  }
}
````
