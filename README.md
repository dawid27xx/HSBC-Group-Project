# Portfolio Manager

Project Description: [https://bitbucket.org/neuedamats/portfoliomanager/src/master/](https://bitbucket.org/neuedamats/portfoliomanager/src/master/)

## Endpoints
- GET:
    - `/portfolios/:user_id` - retrieve all portfolios for a given user.
    - `/assets/:portfolio_id` - retrieve all assets in a given portfolio.
    - `/transactions/:user_id` - retrieve all transactions for a given user.
    - `transactions/:portfolio_id` - retrieve all transactions relating to a given portfolio.
    - `/transactions/:portfolio_asset_id` - retrieve all transactions relating to a given asset in a portfolio.
- POST:
    - `/auth/register` - create a user profile.
    - `/auth/login` - sign in to a user profile.
    - `/create/portfolio` - create a new portfolio.
    - `/create/asset` - add a new asset to a portfolio.
    - `/create/transaction` - add a new transaction relating to a portfolio asset.
- PATCH:
    - `/auth/changepwd` - update a user password.
    - `/update/portfolio/name` - update the name of a user portfolio.
    - `/update/asset/quantity` - update the quantity of a given asset.
- DELETE:
    - `/auth/user` - delete a user profile.
    - `/delete/portfolio` - delete a portfolio.
    - `/delete/asset` - delete an asset.