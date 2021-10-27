"use strict"

var CACHED_CWiseOp = {
  'float64,2,1,0': function () {
    return function divseq_cwise_loop_2s1s0m3f64(SS, a0, t0, p0, Y0) {
      var s0 = SS[0], s1 = SS[1], s2 = SS[2], t0p0 = t0[0], t0p1 = t0[1], t0p2 = t0[2]
      p0 |= 0
      var i0 = 0, i1 = 0, i2 = 0, d0s0 = t0p2, d0s1 = (t0p1 - s2 * t0p2), d0s2 = (t0p0 - s1 * t0p1)
      for (i2 = 0; i2 < s0; ++i2) {
        for (i1 = 0; i1 < s1; ++i1) {
          for (i0 = 0; i0 < s2; ++i0) {
            a0[p0] /= Y0
            p0 += d0s0
          }
          p0 += d0s1
        }
        p0 += d0s2
      }
    }
  },
  'uint8,2,0,1,float64,2,1,0': function () {
    return function muls_cwise_loop_2s0s1m1u8f64(SS, a0, t0, p0, a1, t1, p1, Y0) {
      var s0 = SS[0], s1 = SS[1], s2 = SS[2], t0p0 = t0[0], t0p1 = t0[1], t0p2 = t0[2], t1p0 = t1[0], t1p1 = t1[1], t1p2 = t1[2]
      p0 |= 0
      p1 |= 0
      var offset0 = p0
      var offset1 = p1
      for (var j1 = SS[0] | 0; j1 > 0;) {
        if (j1 < 64) {
          s0 = j1
          j1 = 0
        } else {
          s0 = 64
          j1 -= 64
        }
        for (var j2 = SS[1] | 0; j2 > 0;) {
          if (j2 < 64) {
            s1 = j2
            j2 = 0
          } else {
            s1 = 64
            j2 -= 64
          }
          p0 = (offset0 + j1 * t0p0 + j2 * t0p1)
          p1 = (offset1 + j1 * t1p0 + j2 * t1p1)
          var i0 = 0, i1 = 0, i2 = 0, d0s0 = t0p2, d0s1 = (t0p0 - s2 * t0p2), d0s2 = (t0p1 - s0 * t0p0), d1s0 = t1p2, d1s1 = (t1p0 - s2 * t1p2), d1s2 = (t1p1 - s0 * t1p0)
          for (i2 = 0; i2 < s1; ++i2) {
            for (i1 = 0; i1 < s0; ++i1) {
              for (i0 = 0; i0 < s2; ++i0) {
                a0[p0] = a1[p1] * Y0
                p0 += d0s0
                p1 += d1s0
              }
              p0 += d0s1
              p1 += d1s1
            }
            p0 += d0s2
            p1 += d1s2
          }
        }
      }
    }
  },
  'float32,1,0,float32,1,0': function () {
    return function assign_cwise_loop_1s0m2f32(SS, a0, t0, p0, a1, t1, p1) {
      var s0 = SS[0], s1 = SS[1], t0p0 = t0[0], t0p1 = t0[1], t1p0 = t1[0], t1p1 = t1[1]
      p0 |= 0
      p1 |= 0
      var i0 = 0, i1 = 0, d0s0 = t0p1, d0s1 = (t0p0 - s1 * t0p1), d1s0 = t1p1, d1s1 = (t1p0 - s1 * t1p1)
      for (i1 = 0; i1 < s0; ++i1) {
        for (i0 = 0; i0 < s1; ++i0) {
          a0[p0] = a1[p1]
          p0 += d0s0
          p1 += d1s0
        }
        p0 += d0s1
        p1 += d1s1
      }
    }
  },
  'float32,1,0,float32,0,1': function () {
    return function assign_cwise_loop_1s0m0f32(SS, a0, t0, p0, a1, t1, p1) {
      var s0 = SS[0], s1 = SS[1], t0p0 = t0[0], t0p1 = t0[1], t1p0 = t1[0], t1p1 = t1[1]
      p0 |= 0
      p1 |= 0
      var offset0 = p0
      var offset1 = p1
      for (var j0 = SS[1] | 0; j0 > 0;) {
        if (j0 < 64) {
          s1 = j0
          j0 = 0
        } else {
          s1 = 64
          j0 -= 64
        }
        for (var j1 = SS[0] | 0; j1 > 0;) {
          if (j1 < 64) {
            s0 = j1
            j1 = 0
          } else {
            s0 = 64
            j1 -= 64
          }
          p0 = (offset0 + j0 * t0p1 + j1 * t0p0)
          p1 = (offset1 + j0 * t1p1 + j1 * t1p0)
          var i0 = 0, i1 = 0, d0s0 = t0p1, d0s1 = (t0p0 - s1 * t0p1), d1s0 = t1p1, d1s1 = (t1p0 - s1 * t1p1)
          for (i1 = 0; i1 < s0; ++i1) {
            for (i0 = 0; i0 < s1; ++i0) {
              a0[p0] = a1[p1]
              p0 += d0s0
              p1 += d1s0
            }
            p0 += d0s1
            p1 += d1s1
          }
        }
      }
    }
  },
  'uint8,2,0,1,uint8,1,2,0': function () {
    return function assign_cwise_loop_2s0s1m0u8(SS, a0, t0, p0, a1, t1, p1) {
      var s0 = SS[0], s1 = SS[1], s2 = SS[2], t0p0 = t0[0], t0p1 = t0[1], t0p2 = t0[2], t1p0 = t1[0], t1p1 = t1[1], t1p2 = t1[2]
      p0 |= 0
      p1 |= 0
      var offset0 = p0
      var offset1 = p1
      for (var j0 = SS[2] | 0; j0 > 0;) {
        if (j0 < 64) {
          s2 = j0
          j0 = 0
        } else {
          s2 = 64
          j0 -= 64
        }
        for (var j1 = SS[0] | 0; j1 > 0;) {
          if (j1 < 64) {
            s0 = j1
            j1 = 0
          } else {
            s0 = 64
            j1 -= 64
          }
          for (var j2 = SS[1] | 0; j2 > 0;) {
            if (j2 < 64) {
              s1 = j2
              j2 = 0
            } else {
              s1 = 64
              j2 -= 64
            }
            p0 = (offset0 + j0 * t0p2 + j1 * t0p0 + j2 * t0p1)
            p1 = (offset1 + j0 * t1p2 + j1 * t1p0 + j2 * t1p1)
            var i0 = 0, i1 = 0, i2 = 0, d0s0 = t0p2, d0s1 = (t0p0 - s2 * t0p2), d0s2 = (t0p1 - s0 * t0p0), d1s0 = t1p2, d1s1 = (t1p0 - s2 * t1p2), d1s2 = (t1p1 - s0 * t1p0)
            for (i2 = 0; i2 < s1; ++i2) {
              for (i1 = 0; i1 < s0; ++i1) {
                for (i0 = 0; i0 < s2; ++i0) {
                  a0[p0] = a1[p1]
                  p0 += d0s0
                  p1 += d1s0
                }
                p0 += d0s1
                p1 += d1s1
              }
              p0 += d0s2
              p1 += d1s2
            }
          }
        }
      }
    }
  },
  'uint8,2,0,1,array,2,0,1': function () {
    return function assign_cwise_loop_2s0s1m3u8a(SS, a0, t0, p0, a1, t1, p1) {
      var s0 = SS[0], s1 = SS[1], s2 = SS[2], t0p0 = t0[0], t0p1 = t0[1], t0p2 = t0[2], t1p0 = t1[0], t1p1 = t1[1], t1p2 = t1[2]
      p0 |= 0
      p1 |= 0
      var i0 = 0, i1 = 0, i2 = 0, d0s0 = t0p2, d0s1 = (t0p0 - s2 * t0p2), d0s2 = (t0p1 - s0 * t0p0), d1s0 = t1p2, d1s1 = (t1p0 - s2 * t1p2), d1s2 = (t1p1 - s0 * t1p0)
      for (i2 = 0; i2 < s1; ++i2) {
        for (i1 = 0; i1 < s0; ++i1) {
          for (i0 = 0; i0 < s2; ++i0) {
            a0[p0] = a1[p1]
            p0 += d0s0
            p1 += d1s0
          }
          p0 += d0s1
          p1 += d1s1
        }
        p0 += d0s2
        p1 += d1s2
      }
    }
  },
}

//Generates a cwise operator
function generateCWiseOp(proc, typesig) {
  var key = typesig.join(',')
  var f = CACHED_CWiseOp[key]
  return f()
}

var compile = generateCWiseOp

var CACHED_thunk = {
  mul: function (compile) {
    var CACHED = {}
    return function mul_cwise_thunk(array0, array1, array2) {
      var t0 = array0.dtype,
        r0 = array0.order,
        t1 = array1.dtype,
        r1 = array1.order,
        t2 = array2.dtype,
        r2 = array2.order,
        type = [t0, r0.join(), t1, r1.join(), t2, r2.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0, t1, r1, t2, r2])
      }
      return proc(
        array0.shape.slice(0),
        array0.data,
        array0.stride,
        array0.offset | 0,
        array1.data,
        array1.stride,
        array1.offset | 0,
        array2.data,
        array2.stride,
        array2.offset | 0
      )
    }
  },
  muls: function (compile) {
    var CACHED = {}
    return function muls_cwise_thunk(array0, array1, scalar2) {
      var t0 = array0.dtype,
        r0 = array0.order,
        t1 = array1.dtype,
        r1 = array1.order,
        type = [t0, r0.join(), t1, r1.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0, t1, r1])
      }
      return proc(
        array0.shape.slice(0),
        array0.data,
        array0.stride,
        array0.offset | 0,
        array1.data,
        array1.stride,
        array1.offset | 0,
        scalar2
      )
    }
  },
  mulseq: function (compile) {
    var CACHED = {}
    return function mulseq_cwise_thunk(array0, scalar1) {
      var t0 = array0.dtype,
        r0 = array0.order,
        type = [t0, r0.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0])
      }
      return proc(array0.shape.slice(0), array0.data, array0.stride, array0.offset | 0, scalar1)
    }
  },
  div: function (compile) {
    var CACHED = {}
    return function div_cwise_thunk(array0, array1, array2) {
      var t0 = array0.dtype,
        r0 = array0.order,
        t1 = array1.dtype,
        r1 = array1.order,
        t2 = array2.dtype,
        r2 = array2.order,
        type = [t0, r0.join(), t1, r1.join(), t2, r2.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0, t1, r1, t2, r2])
      }
      return proc(
        array0.shape.slice(0),
        array0.data,
        array0.stride,
        array0.offset | 0,
        array1.data,
        array1.stride,
        array1.offset | 0,
        array2.data,
        array2.stride,
        array2.offset | 0
      )
    }
  },
  divs: function (compile) {
    var CACHED = {}
    return function divs_cwise_thunk(array0, array1, scalar2) {
      var t0 = array0.dtype,
        r0 = array0.order,
        t1 = array1.dtype,
        r1 = array1.order,
        type = [t0, r0.join(), t1, r1.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0, t1, r1])
      }
      return proc(
        array0.shape.slice(0),
        array0.data,
        array0.stride,
        array0.offset | 0,
        array1.data,
        array1.stride,
        array1.offset | 0,
        scalar2
      )
    }
  },
  divseq: function (compile) {
    var CACHED = {}
    return function divseq_cwise_thunk(array0, scalar1) {
      var t0 = array0.dtype,
        r0 = array0.order,
        type = [t0, r0.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0])
      }
      return proc(array0.shape.slice(0), array0.data, array0.stride, array0.offset | 0, scalar1)
    }
  },
  assign: function (compile) {
    var CACHED = {}
    return function assign_cwise_thunk(array0, array1) {
      var t0 = array0.dtype,
        r0 = array0.order,
        t1 = array1.dtype,
        r1 = array1.order,
        type = [t0, r0.join(), t1, r1.join()].join(),
        proc = CACHED[type]
      if (!proc) {
        CACHED[type] = proc = compile([t0, r0, t1, r1])
      }
      return proc(
        array0.shape.slice(0),
        array0.data,
        array0.stride,
        array0.offset | 0,
        array1.data,
        array1.stride,
        array1.offset | 0
      )
    }
  },
}

function createThunk(proc) {
  var thunk = CACHED_thunk[proc.funcName]
  return thunk(compile.bind(undefined, proc))
}

function makeOp(user_args) {
  return createThunk({
    funcName: user_args.funcName
  })
}

var assign_ops = {
  mul:  "*",
  div:  "/",
}
;(function(){
  for(var id in assign_ops) {
    exports[id] = makeOp({
      funcName: id
    })
    exports[id+"s"] = makeOp({
      funcName: id+"s"
    })
    exports[id+"seq"] = makeOp({
      funcName: id+"seq"
    })
  }
})();

exports.assign = makeOp({
  funcName: "assign" })
