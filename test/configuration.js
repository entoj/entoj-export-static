'use strict';

/**
 * Configure path
 */
const path = require('path');
global.STATIC_SOURCE = path.resolve(__dirname + '/../source');
global.STATIC_FIXTURES = path.resolve(__dirname + '/__fixtures__');
global.STATIC_TEST = __dirname;


/**
 * Configure chai
 */
const chai = require('chai');
chai.config.includeStack = true;
global.expect = chai.expect;
