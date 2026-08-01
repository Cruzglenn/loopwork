const b = require('node:buffer');
if (!b.SlowBuffer) {
  b.SlowBuffer = function () {};
  b.SlowBuffer.prototype = {};
}
