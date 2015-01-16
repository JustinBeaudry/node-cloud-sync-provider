'use strict';

var Data = require('./data');

function Provider(opts) {
  opts = opts || {};
 
  this.data = new Data(); 
  this.config = null;
  this.state = null;
  this.__last_sync = null;
  // sync time overrides sync_rate
  this.sync_time = opts.sync_time || null;  
  this.sync_rate = this.sync_time ? (opts.sync_rate || 60 * 60 * 1000) : null; // default: 1/hour
}

_.extend(Provider.prototype, {
  // providers should check the configuration
  checkConfig: function checkProviderConfiguration() {
    throw new Error('checkConfig is not implemented.');
  },
  // providers should get data
  getData: function getProviderData() {
    throw new Error('getData is not implemented.');
  },
  // providers should check data against checksums
  checkData: function checkProviderData() {
    throw new Error('checkData is not implemented.');
  }
});

module.exports = Provider;
