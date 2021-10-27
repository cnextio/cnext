"use strict"

var pool = require("typedarray-pool")

module.exports = createSurfaceExtractor

var allFns = {
  "false,0,1": function surfaceProcedure(vertex, face, phase, mallocUint32, freeUint32) {
    return function extractContour0_1(a0, x0, x1, x2) {
      var s0 = a0.shape[0] | 0,
        s1 = a0.shape[1] | 0,
        d0 = a0.data,
        o0 = a0.offset | 0,
        t0_0 = a0.stride[0] | 0,
        t0_1 = a0.stride[1] | 0,
        p0 = o0,
        c0_0,
        d0_1 = -t0_0 | 0,
        c0_1 = 0,
        d0_2 = -t0_1 | 0,
        c0_2 = 0,
        d0_3 = (-t0_0 - t0_1) | 0,
        c0_3 = 0,
        u0_0 = t0_0 | 0,
        u0_1 = (t0_1 - t0_0 * s0) | 0,
        i0 = 0,
        i1 = 0,
        N = 0,
        Q = (2 * s0) | 0,
        P = mallocUint32(Q),
        V = mallocUint32(Q),
        X = 0,
        b0 = 0,
        e1 = -1 | 0,
        y1 = -1 | 0,
        b1 = 0,
        e2 = -s0 | 0,
        y2 = s0 | 0,
        b2 = 0,
        e3 = (-s0 - 1) | 0,
        y3 = (s0 - 1) | 0,
        b3 = 0,
        v0 = 0,
        T = 0
      for (i0 = 0; i0 < s0; ++i0) {
        P[X++] = phase(d0[p0], x0, x1, x2)
        p0 += u0_0
      }
      p0 += u0_1
      if (s1 > 0) {
        i1 = 1
        P[X++] = phase(d0[p0], x0, x1, x2)
        p0 += u0_0
        if (s0 > 0) {
          i0 = 1
          c0_0 = d0[p0]
          b0 = P[X] = phase(c0_0, x0, x1, x2)
          b1 = P[X + e1]
          b2 = P[X + e2]
          b3 = P[X + e3]
          if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
            c0_1 = d0[p0 + d0_1]
            c0_2 = d0[p0 + d0_2]
            c0_3 = d0[p0 + d0_3]
            vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
            v0 = V[X] = N++
          }
          X += 1
          p0 += u0_0
          for (i0 = 2; i0 < s0; ++i0) {
            c0_0 = d0[p0]
            b0 = P[X] = phase(c0_0, x0, x1, x2)
            b1 = P[X + e1]
            b2 = P[X + e2]
            b3 = P[X + e3]
            if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
              c0_1 = d0[p0 + d0_1]
              c0_2 = d0[p0 + d0_2]
              c0_3 = d0[p0 + d0_3]
              vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
              v0 = V[X] = N++
              if (b3 !== b1) {
                face(V[X + e1], v0, c0_3, c0_1, b3, b1, x0, x1, x2)
              }
            }
            X += 1
            p0 += u0_0
          }
        }
        p0 += u0_1
        X = 0
        T = e1
        e1 = y1
        y1 = T
        T = e2
        e2 = y2
        y2 = T
        T = e3
        e3 = y3
        y3 = T
        for (i1 = 2; i1 < s1; ++i1) {
          P[X++] = phase(d0[p0], x0, x1, x2)
          p0 += u0_0
          if (s0 > 0) {
            i0 = 1
            c0_0 = d0[p0]
            b0 = P[X] = phase(c0_0, x0, x1, x2)
            b1 = P[X + e1]
            b2 = P[X + e2]
            b3 = P[X + e3]
            if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
              c0_1 = d0[p0 + d0_1]
              c0_2 = d0[p0 + d0_2]
              c0_3 = d0[p0 + d0_3]
              vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
              v0 = V[X] = N++
              if (b3 !== b2) {
                face(V[X + e2], v0, c0_2, c0_3, b2, b3, x0, x1, x2)
              }
            }
            X += 1
            p0 += u0_0
            for (i0 = 2; i0 < s0; ++i0) {
              c0_0 = d0[p0]
              b0 = P[X] = phase(c0_0, x0, x1, x2)
              b1 = P[X + e1]
              b2 = P[X + e2]
              b3 = P[X + e3]
              if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
                c0_1 = d0[p0 + d0_1]
                c0_2 = d0[p0 + d0_2]
                c0_3 = d0[p0 + d0_3]
                vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
                v0 = V[X] = N++
                if (b3 !== b2) {
                  face(V[X + e2], v0, c0_2, c0_3, b2, b3, x0, x1, x2)
                }
                if (b3 !== b1) {
                  face(V[X + e1], v0, c0_3, c0_1, b3, b1, x0, x1, x2)
                }
              }
              X += 1
              p0 += u0_0
            }
          }
          if (i1 & 1) {
            X = 0
          }
          T = e1
          e1 = y1
          y1 = T
          T = e2
          e2 = y2
          y2 = T
          T = e3
          e3 = y3
          y3 = T
          p0 += u0_1
        }
      }
      freeUint32(V)
      freeUint32(P)
    }
  },
  "false,1,0": function anonymous(vertex, face, phase, mallocUint32, freeUint32) {
    return function extractContour1_0(a0, x0, x1, x2) {
      var s0 = a0.shape[0] | 0,
        s1 = a0.shape[1] | 0,
        d0 = a0.data,
        o0 = a0.offset | 0,
        t0_0 = a0.stride[0] | 0,
        t0_1 = a0.stride[1] | 0,
        p0 = o0,
        c0_0,
        d0_1 = -t0_0 | 0,
        c0_1 = 0,
        d0_2 = -t0_1 | 0,
        c0_2 = 0,
        d0_3 = (-t0_0 - t0_1) | 0,
        c0_3 = 0,
        u0_1 = t0_1 | 0,
        u0_0 = (t0_0 - t0_1 * s1) | 0,
        i0 = 0,
        i1 = 0,
        N = 0,
        Q = (2 * s1) | 0,
        P = mallocUint32(Q),
        V = mallocUint32(Q),
        X = 0,
        b0 = 0,
        e2 = -1 | 0,
        y2 = -1 | 0,
        b2 = 0,
        e1 = -s1 | 0,
        y1 = s1 | 0,
        b1 = 0,
        e3 = (-s1 - 1) | 0,
        y3 = (s1 - 1) | 0,
        b3 = 0,
        v0 = 0,
        T = 0
      for (i1 = 0; i1 < s1; ++i1) {
        P[X++] = phase(d0[p0], x0, x1, x2)
        p0 += u0_1
      }
      p0 += u0_0
      if (s0 > 0) {
        i0 = 1
        P[X++] = phase(d0[p0], x0, x1, x2)
        p0 += u0_1
        if (s1 > 0) {
          i1 = 1
          c0_0 = d0[p0]
          b0 = P[X] = phase(c0_0, x0, x1, x2)
          b1 = P[X + e1]
          b2 = P[X + e2]
          b3 = P[X + e3]
          if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
            c0_1 = d0[p0 + d0_1]
            c0_2 = d0[p0 + d0_2]
            c0_3 = d0[p0 + d0_3]
            vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
            v0 = V[X] = N++
          }
          X += 1
          p0 += u0_1
          for (i1 = 2; i1 < s1; ++i1) {
            c0_0 = d0[p0]
            b0 = P[X] = phase(c0_0, x0, x1, x2)
            b1 = P[X + e1]
            b2 = P[X + e2]
            b3 = P[X + e3]
            if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
              c0_1 = d0[p0 + d0_1]
              c0_2 = d0[p0 + d0_2]
              c0_3 = d0[p0 + d0_3]
              vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
              v0 = V[X] = N++
              if (b3 !== b2) {
                face(V[X + e2], v0, c0_2, c0_3, b2, b3, x0, x1, x2)
              }
            }
            X += 1
            p0 += u0_1
          }
        }
        p0 += u0_0
        X = 0
        T = e1
        e1 = y1
        y1 = T
        T = e2
        e2 = y2
        y2 = T
        T = e3
        e3 = y3
        y3 = T
        for (i0 = 2; i0 < s0; ++i0) {
          P[X++] = phase(d0[p0], x0, x1, x2)
          p0 += u0_1
          if (s1 > 0) {
            i1 = 1
            c0_0 = d0[p0]
            b0 = P[X] = phase(c0_0, x0, x1, x2)
            b1 = P[X + e1]
            b2 = P[X + e2]
            b3 = P[X + e3]
            if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
              c0_1 = d0[p0 + d0_1]
              c0_2 = d0[p0 + d0_2]
              c0_3 = d0[p0 + d0_3]
              vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
              v0 = V[X] = N++
              if (b3 !== b1) {
                face(V[X + e1], v0, c0_3, c0_1, b3, b1, x0, x1, x2)
              }
            }
            X += 1
            p0 += u0_1
            for (i1 = 2; i1 < s1; ++i1) {
              c0_0 = d0[p0]
              b0 = P[X] = phase(c0_0, x0, x1, x2)
              b1 = P[X + e1]
              b2 = P[X + e2]
              b3 = P[X + e3]
              if (b0 !== b1 || b0 !== b2 || b0 !== b3) {
                c0_1 = d0[p0 + d0_1]
                c0_2 = d0[p0 + d0_2]
                c0_3 = d0[p0 + d0_3]
                vertex(i0, i1, c0_0, c0_1, c0_2, c0_3, b0, b1, b2, b3, x0, x1, x2)
                v0 = V[X] = N++
                if (b3 !== b2) {
                  face(V[X + e2], v0, c0_2, c0_3, b2, b3, x0, x1, x2)
                }
                if (b3 !== b1) {
                  face(V[X + e1], v0, c0_3, c0_1, b3, b1, x0, x1, x2)
                }
              }
              X += 1
              p0 += u0_1
            }
          }
          if (i0 & 1) {
            X = 0
          }
          T = e1
          e1 = y1
          y1 = T
          T = e2
          e2 = y2
          y2 = T
          T = e3
          e3 = y3
          y3 = T
          p0 += u0_0
        }
      }
      freeUint32(V)
      freeUint32(P)
    }
  },
}

//Generates the surface procedure
function compileSurfaceProcedure(vertexFunc, faceFunc, phaseFunc, scalarArgs, order, typesig) {
  var key = [typesig, order].join(',')
  var proc = allFns[key]

  return proc(
    vertexFunc,
    faceFunc,
    phaseFunc,
    pool.mallocUint32,
    pool.freeUint32)
}

function createSurfaceExtractor(args) {
  function error(msg) {
    throw new Error("ndarray-extract-contour: " + msg)
  }
  if(typeof args !== "object") {
    error("Must specify arguments")
  }
  var order = args.order
  if(!Array.isArray(order)) {
    error("Must specify order")
  }
  var arrays = args.arrayArguments||1
  if(arrays < 1) {
    error("Must have at least one array argument")
  }
  var scalars = args.scalarArguments||0
  if(scalars < 0) {
    error("Scalar arg count must be > 0")
  }
  if(typeof args.vertex !== "function") {
    error("Must specify vertex creation function")
  }
  if(typeof args.cell !== "function") {
    error("Must specify cell creation function")
  }
  if(typeof args.phase !== "function") {
    error("Must specify phase function")
  }
  var getters = args.getters || []
  var typesig = new Array(arrays)
  for(var i=0; i<arrays; ++i) {
    if(getters.indexOf(i) >= 0) {
      typesig[i] = true
    } else {
      typesig[i] = false
    }
  }
  return compileSurfaceProcedure(
    args.vertex,
    args.cell,
    args.phase,
    scalars,
    order,
    typesig)
}