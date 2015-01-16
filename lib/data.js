'use strict';

var _ = require('lodash');
var crypto = require('crypto');
var uuid = require('node-uuid');
var emitter = require('events').EventEmitter;

function Data() {
  __proto__ = null;
  var id = null;
  var data = null;
  var checksum = null;
  var modified = null;
  var history = [];
  var __observed = false;

  Object.defineProperty(this, 'id', {
    value: uuid.v4(),
    writable: false,
    configurable: false,
    enumerable: true
  });

  Object.defineProperty(this, 'data', {
    configurable: false,
    enumerable: true,
    get: function() {
      return data;
    },
    set: function(value) {
      
      function update() {
        checksum = value;
        data = value;
        modified = true;

        if (__observed) {
          emitter.emit(id + '-update', data, history[0]);
        }
        history.push({value: value, checksum: checksum, modified: modified});
      }

      if (history.length > 0) {
        // check most recent history
        if (history[0].checksum === crypto.createHash('md5').update(value).digest('hex')) {
          return;
        }
        update();
      } else {
        update();
      }
    }
  });

  Object.defineProperty(this, 'checksum', {
    configurable: false,
    enumerable: true,
    get: function() {
      return checksum;
    },
    set: function(value) {
      checksum = crypto.createHash('md5').update(value).digest('hex');
    }
  });

  Object.defineProperty(this, 'modified', {
    configurable: false,
    enumerable: true,
    get: function() {
      return modified;
    },
    set: function(value) {
      if (value) {
        modified = Date.now();
      }
    }
  });

  Object.defineProperty(this, 'history', {
    configurable: false,
    enumerable: true
  });

  Object.defineProperty(this, '__observed', {
    configurable: false,
    enumerable: false
  });
}

_.extend(Data.prototype, {
  writable: function() {
    Object.defineProperty(this, 'data', {
      writable: true
    });
  },
  unwritable: function() {
    Object.defineProperty(this, 'data', {
      writable: false
    });
  },
  observe: function(callback) {
    this.__observed = true;
    emitter.on(this.id + '-update', function(value, oldValue) {
      callback(value, oldValue);
    });
  },
  observeOnce: function(callback) {
    this.__observed = true;
    emitter.once(this.id + '-update', function(value, oldValue) {
      this.__observed = false;
      callback(value, oldValue);
    });
  },
  unobserve: function() {
    emitter.removeAllListeners(this.id + '-update');
    this.__observed = false;
  }
});

module.exports = Data;
