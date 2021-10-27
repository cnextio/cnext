"use strict"

function CwiseOp() {
  return function (SS, a0, t0, p0, Y0) {
    var s0 = SS[0],
      s1 = SS[1],
      s2 = SS[2],
      t0p0 = t0[0],
      t0p1 = t0[1],
      t0p2 = t0[2],
      index = [0, 0, 0];
    p0 |= 0;
    var i0 = 0,
      i1 = 0,
      i2 = 0,
      d0s0 = t0p2,
      d0s1 = t0p1 - s2 * t0p2,
      d0s2 = t0p0 - s1 * t0p1;
    for (i2 = 0; i2 < s0; ++i2) {
      for (i1 = 0; i1 < s1; ++i1) {
        for (i0 = 0; i0 < s2; ++i0) {
          {
            var _inline_1_v = Y0,
              _inline_1_i;
            for (
              _inline_1_i = 0;
              _inline_1_i < index.length - 1;
              ++_inline_1_i
            ) {
              _inline_1_v = _inline_1_v[index[_inline_1_i]];
            }
            a0[p0] = _inline_1_v[index[index.length - 1]];
          }
          p0 += d0s0;
          ++index[2];
        }
        p0 += d0s1;
        index[2] -= s2;
        ++index[1];
      }
      p0 += d0s2;
      index[1] -= s1;
      ++index[0];
    }
  };
}

//Generates a cwise operator
function generateCWiseOp() {
  return CwiseOp()
}

var compile = generateCWiseOp

function thunk(compile) {
  var CACHED = {};
  return function convert_cwise_thunk(array0, scalar1) {
    var t0 = array0.dtype,
      r0 = array0.order,
      type = [t0, r0.join()].join(),
      proc = CACHED[type];
    if (!proc) {
      CACHED[type] = proc = compile([t0, r0]);
    }
    return proc(
      array0.shape.slice(0),
      array0.data,
      array0.stride,
      array0.offset | 0,
      scalar1
    );
  };
}

function createThunk(proc) {
  return thunk(compile.bind(undefined, proc))
}

function compileCwise(user_args) {
  return createThunk({
    funcName: user_args.funcName
  })
}

module.exports = compileCwise({
  funcName: "convert"
});
