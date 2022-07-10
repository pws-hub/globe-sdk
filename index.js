
const Authorizer = require('./lib/Authorizer') // Microservices interconnection authorization handler
const MDP = require('./lib/MDP') // Main Data Provider
const APS = require('./lib/APS') // Authentication Process Server
const WPS = require('./lib/WPS') // Webhook Protocol Server
const BND = require('./lib/BND') // Bulk Notification Dispatcher
const CSA = require('./lib/CSA') // Cubic Server API
const CAS = require('./lib/CAS') // CDN Assets Space
const DTF = require('./lib/DTF') // Delta to File

module.exports = { Authorizer, MDP, APS, WPS, BND, CSA, CAS, DTF }