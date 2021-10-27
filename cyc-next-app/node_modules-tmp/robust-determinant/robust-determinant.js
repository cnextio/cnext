"use strict"

var twoProduct = require("two-product")
var robustSum = require("robust-sum")
var robustScale = require("robust-scale")
var compress = require("robust-compress")

var NUM_EXPANDED = 4

function determinant_2(sum, scale, prod, compress) {
  return function robustDeterminant2(m) {
    return compress(sum(prod(m[0][0], m[1][1]), prod(-m[0][1], m[1][0])))
  }
}

function determinant_3(sum, scale, prod, compress) {
  return function robustDeterminant3(m) {
    return compress(sum(scale(sum(prod(m[1][1], m[2][2]), prod(-m[1][2], m[2][1])), m[0][0]), sum(scale(sum(prod(m[1][0], m[2][2]), prod(-m[1][2], m[2][0])), -m[0][1]), scale(sum(prod(m[1][0], m[2][1]), prod(-m[1][1], m[2][0])), m[0][2]))))
  }
}

function compileDeterminant(n) {
  var fn =
    n === 2 ? determinant_2 :
    n === 3 ? determinant_3 : undefined
  return fn(robustSum, robustScale, twoProduct, compress)
}

var CACHE = [
  function robustDeterminant0() { return [0] },
  function robustDeterminant1(m) { return [m[0][0]] }
]

function proc(det0, det1, det2, det3, CACHE, gen) {
  return function robustDeterminant(m) {
    switch (m.length) {
      case 0:
        return det0(m)
      case 1:
        return det1(m)
      case 2:
        return det2(m)
      case 3:
        return det3(m)
    }
    var det = CACHE[m.length]
    if (!det) det = CACHE[m.length] = gen(m.length)
    return det(m)
  }
}

function generateDispatch() {
  while(CACHE.length < NUM_EXPANDED) {
    CACHE.push(compileDeterminant(CACHE.length))
  }

  module.exports = proc.apply(undefined, CACHE.concat([CACHE, compileDeterminant]))
  for(var i=0; i<CACHE.length; ++i) {
    module.exports[i] = CACHE[i]
  }
}

generateDispatch()