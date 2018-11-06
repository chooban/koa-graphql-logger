const flow = require('lodash/fp/flow')
const truncate = require('lodash/fp/truncate')
const identity = require('lodash/fp/identity')
const cloneDeepWith = require('lodash/fp/cloneDeepWith')
const mapValues = require('lodash/fp/mapValues')
const { inspect, format } = require('util')

const redactField = (sensitiveFields) => (value, index) =>
  (index && sensitiveFields.includes(index)) ? 'REDACTED' : undefined

const redactor = (sensitiveFields, truncateValues = true) => {
  const redactIfSensitive = redactField(sensitiveFields)
  const trunc = truncateValues
    ? truncate({})
    : identity()

  return (variables) =>
    flow(
      cloneDeepWith(redactIfSensitive),
      mapValues(inspect),
      mapValues(s => s.replace(/\s*\n\s*/g, ' ')),
      mapValues(trunc)
    )(variables)
}

const graphqlLogger = ({ logger, sensitiveFields = [], truncateValues = true }) => {
  const redact = redactor(sensitiveFields, truncateValues)
  logger('Adding middleware for logging GraphQL requests')
  return async (ctx, next) => {
    const { query, variables } = ctx.request.body
    const q = (query || '').replace(/\s*\n\s*/g, ' ')
    logger(format('Query: %s.  Variables: %j', q, redact(variables)))
    await next()
    try {
      const resp = JSON.parse(ctx.response.body)
      if (resp.errors) {
        logger.format('Response: %j', redactor(sensitiveFields, false)(resp))
      } else {
        logger(format('Response: %j', redact(resp)))
      }
    } catch {
      logger(format('Response: %j', ctx.response.body))
    }
  }
}

module.exports = graphqlLogger
