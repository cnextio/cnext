"use strict"

var determinant = require("robust-determinant")

var NUM_EXPAND = 3

function generateSolver(n) {
  var fn =
    n === 2 ? solve2d : solve3d

  if(n < NUM_EXPAND) {
    return fn(determinant[n])
  }
  return fn(determinant)
}

function robustLinearSolve0d() {
  return [ [ 0 ] ]
}

function robustLinearSolve1d(A, b) {
  return [ [ b[0] ], [ A[0][0] ] ]
}

function solve2d(det) {
  return function robustLinearSolve2d(A, b) {
    return [det([[+b[0], +A[0][1]], [+b[1], +A[1][1]]]), det([[+A[0][0], +b[0]], [+A[1][0], +b[1]]]), det(A)]
  }
}

function solve3d(det) {
  return function robustLinearSolve3d(A, b) {
    return [det([[+b[0], +A[0][1], +A[0][2]], [+b[1], +A[1][1], +A[1][2]], [+b[2], +A[2][1], +A[2][2]]]), det([[+A[0][0], +b[0], +A[0][2]], [+A[1][0], +b[1], +A[1][2]], [+A[2][0], +b[2], +A[2][2]]]), det([[+A[0][0], +A[0][1], +b[0]], [+A[1][0], +A[1][1], +b[1]], [+A[2][0], +A[2][1], +b[2]]]), det(A)]
  }
}

var CACHE = [
  robustLinearSolve0d,
  robustLinearSolve1d
]

function proc(s0, s1, s2, s3, CACHE, g) {
  return function dispatchLinearSolve(A, b) {
    switch (A.length) {
      case 0: return s0(A, b);
      case 1: return s1(A, b);
      case 2: return s2(A, b);
      case 3: return s3(A, b);
    }
    var s = CACHE[A.length];
    if (!s) s = CACHE[A.length] = g(A.length);
    return s(A, b)
  }
}

function generateDispatch() {
  while(CACHE.length <= NUM_EXPAND) {
    CACHE.push(generateSolver(CACHE.length))
  }
  module.exports = proc.apply(undefined, CACHE.concat([CACHE, generateSolver]))
  for(var i=0; i<NUM_EXPAND; ++i) {
    module.exports[i] = CACHE[i]
  }
}

generateDispatch()