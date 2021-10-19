"use strict"

function CWiseOp() {
  return function(SS, a0, t0, p0, Y0, Y1) {
    var s0 = SS[0],
      t0p0 = t0[0],
      index = [0],
      q0 = t0p0
    p0 |= 0
    var i0 = 0,
      d0s0 = t0p0
    for (i0 = 0; i0 < s0; ++i0) {
      {
        var da = a0[p0] - Y1
        var db = a0[p0 + q0] - Y1
        if (da >= 0 !== db >= 0) {
          Y0.push(index[0] + 0.5 + (0.5 * (da + db)) / (da - db))
        }
      }
      p0 += d0s0
      ++index[0]
    }
  }
}

//Generates a cwise operator
function generateCWiseOp() {
  return CWiseOp()
}

var compile = generateCWiseOp

function thunk(compile) {
  var CACHED = {}
  return function zeroCrossings_cwise_thunk(array0, scalar2, scalar3) {
    var t0 = array0.dtype,
      r0 = array0.order,
      type = [t0, r0.join()].join(),
      proc = CACHED[type]

    if (!proc) {
      CACHED[type] = proc = compile([t0, r0])
    }

    return proc(array0.shape.slice(0), array0.data, array0.stride, array0.offset | 0, scalar2, scalar3)
  }
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
    funcName: 'zeroCrossings'
})
