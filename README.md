# Portfolio Manager

Project Description: [https://bitbucket.org/neuedamats/portfoliomanager/src/master/](https://bitbucket.org/neuedamats/portfoliomanager/src/master/)

## Endpoints
- GET:
    - `/portfolio/` - retrieve all portfolios for a given user.
    - `/portfolio/asset` - retrieve all assets in a given portfolio.
    - `/transactions/:userId` - retrieve all transactions for a given user. 
    - `/transactions/:portfolioId` - retrieve all transactions relating to a given portfolio.
    - `/transactions/:portfolioAssetId` - retrieve all transactions relating to a given asset in a portfolio.
- POST:
    - `/auth/register` - create a user profile.
    - `/auth/login` - sign in to a user profile.
    - `/portfolio` - create a new portfolio.
    - `/portfolio/asset` - add a new asset to a portfolio.
    - `/transaction` - add a new transaction relating to a portfolio asset.
- PATCH:
    - `/portfolio` - update the name of a user portfolio.
    - `/portfolio/asset` - update the quantity of a given asset.
- DELETE:
    - `/auth/user` - delete a user profile.
    - `/portfolio` - delete a portfolio.
    - `/portfolio/asset` - delete an asset from a portfolio.
