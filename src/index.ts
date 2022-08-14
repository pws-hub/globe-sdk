
export const Authorizer = require('./lib/Authorizer') // Microservices interconnection authorization handler
export const MDP = require('./lib/MDP') // Main Data Provider
export const APS = require('./lib/APS') // Authentication Process Server
export const WPS = require('./lib/WPS') // Webhook Protocol Server
export const BND = require('./lib/BND') // Bulk Notification Dispatcher
export const CSA = require('./lib/CSA') // Cubic Server API
export const CAS = require('./lib/CAS') // CDN Assets Space
export const DTF = require('./lib/DTF') // Delta to File

export default { Authorizer, MDP, APS, WPS, BND, CSA, CAS, DTF }