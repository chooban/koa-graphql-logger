GraphQL Koa Logger Middleware
-----------------------------

A small piece of middleware to log incoming GraphQL requests and their responses.

Usage
-----

```javascript
const graphqlLogger = require('koa-graphql-logger')

const routes = new Router()
app.use(routes.routes())

routes.post(
  '/graphql',
  graphqlLogger({
    logger: console.log,
    sensitiveFields: [
      'password'
    ],
    truncateValues: false
  })
)
```
