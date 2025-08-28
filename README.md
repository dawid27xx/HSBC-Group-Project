# Portfolio Manager

Project Description: [https://bitbucket.org/neuedamats/portfoliomanager/src/master/](https://bitbucket.org/neuedamats/portfoliomanager/src/master/)

## Demo User
- Username: `user`
- Password: `1234`

## Endpoints
- GET:
    - `/portfolio/` - retrieve all portfolios for a given user. DONE
    - `/portfolio/asset` - retrieve all assets in a given portfolio. DONE
    - `/transactions/:userId` - retrieve all transactions for a given user. DONE 
    - `/transactions/:portfolioId` - retrieve all transactions relating to a given portfolio. DONE
    - `/transactions/:portfolioAssetId` - retrieve all transactions relating to a given asset in a portfolio. DONE
- POST:
    - `/auth/register` - create a user profile. 
    - `/auth/login` - sign in to a user profile.
    - `/portfolio` - create a new portfolio. DONE
    - `/portfolio/asset` - add a new asset to a portfolio. DONE
    - `/transaction` - add a new transaction relating to a portfolio asset. DONE
- PATCH:
    - `/portfolio` - update the name of a user portfolio. 
    - `/portfolio/asset` - update the quantity of a given asset. buy/sell order. DONE
- DELETE:
    - `/auth/user` - delete a user profile.
    - `/portfolio` - delete a portfolio.
    - `/portfolio/asset` - delete an asset from a portfolio.
