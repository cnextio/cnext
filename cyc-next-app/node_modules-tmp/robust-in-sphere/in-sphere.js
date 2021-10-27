"use strict"

var twoProduct = require("two-product")
var robustSum = require("robust-sum")
var robustDiff = require("robust-subtract")
var robustScale = require("robust-scale")

var NUM_EXPAND = 6

function orientation(n) {
  var fn =
    n === 3 ? inSphere3 :
    n === 4 ? inSphere4 :
    n === 5 ? inSphere5 : inSphere6;

  return fn(robustSum, robustDiff, twoProduct, robustScale)
}

function inSphere0() { return 0 }
function inSphere1() { return 0 }
function inSphere2() { return 0 }

function inSphere3(sum, diff, prod, scale) {
  function exactInSphere3(m0, m1, m2) {
    var w0 = prod(m0[0], m0[0])
    var w0m1 = scale(w0, m1[0])
    var w0m2 = scale(w0, m2[0])
    var w1 = prod(m1[0], m1[0])
    var w1m0 = scale(w1, m0[0])
    var w1m2 = scale(w1, m2[0])
    var w2 = prod(m2[0], m2[0])
    var w2m0 = scale(w2, m0[0])
    var w2m1 = scale(w2, m1[0])
    var p = sum(diff(w2m1, w1m2), diff(w1m0, w0m1))
    var n = diff(w2m0, w0m2)
    var d = diff(p, n)
    return d[d.length - 1]
  }
  return exactInSphere3
}

function inSphere4(sum, diff, prod, scale) {
  function exactInSphere4(m0, m1, m2, m3) {
    var w0 = sum(prod(m0[0], m0[0]), prod(m0[1], m0[1]))
    var w0m1 = scale(w0, m1[0])
    var w0m2 = scale(w0, m2[0])
    var w0m3 = scale(w0, m3[0])
    var w1 = sum(prod(m1[0], m1[0]), prod(m1[1], m1[1]))
    var w1m0 = scale(w1, m0[0])
    var w1m2 = scale(w1, m2[0])
    var w1m3 = scale(w1, m3[0])
    var w2 = sum(prod(m2[0], m2[0]), prod(m2[1], m2[1]))
    var w2m0 = scale(w2, m0[0])
    var w2m1 = scale(w2, m1[0])
    var w2m3 = scale(w2, m3[0])
    var w3 = sum(prod(m3[0], m3[0]), prod(m3[1], m3[1]))
    var w3m0 = scale(w3, m0[0])
    var w3m1 = scale(w3, m1[0])
    var w3m2 = scale(w3, m2[0])
    var p = sum(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))))
    var n = sum(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))))
    var d = diff(p, n)
    return d[d.length - 1]
  }
  return exactInSphere4
}


function inSphere5(sum, diff, prod, scale) {
  function exactInSphere5(m0, m1, m2, m3, m4) {
    var w0 = sum(prod(m0[0], m0[0]), sum(prod(m0[1], m0[1]), prod(m0[2], m0[2])))
    var w0m1 = scale(w0, m1[0])
    var w0m2 = scale(w0, m2[0])
    var w0m3 = scale(w0, m3[0])
    var w0m4 = scale(w0, m4[0])
    var w1 = sum(prod(m1[0], m1[0]), sum(prod(m1[1], m1[1]), prod(m1[2], m1[2])))
    var w1m0 = scale(w1, m0[0])
    var w1m2 = scale(w1, m2[0])
    var w1m3 = scale(w1, m3[0])
    var w1m4 = scale(w1, m4[0])
    var w2 = sum(prod(m2[0], m2[0]), sum(prod(m2[1], m2[1]), prod(m2[2], m2[2])))
    var w2m0 = scale(w2, m0[0])
    var w2m1 = scale(w2, m1[0])
    var w2m3 = scale(w2, m3[0])
    var w2m4 = scale(w2, m4[0])
    var w3 = sum(prod(m3[0], m3[0]), sum(prod(m3[1], m3[1]), prod(m3[2], m3[2])))
    var w3m0 = scale(w3, m0[0])
    var w3m1 = scale(w3, m1[0])
    var w3m2 = scale(w3, m2[0])
    var w3m4 = scale(w3, m4[0])
    var w4 = sum(prod(m4[0], m4[0]), sum(prod(m4[1], m4[1]), prod(m4[2], m4[2])))
    var w4m0 = scale(w4, m0[0])
    var w4m1 = scale(w4, m1[0])
    var w4m2 = scale(w4, m2[0])
    var w4m3 = scale(w4, m3[0])
    var p = sum(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m1[2]), sum(scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), -m2[2]), scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m3[2]))), sum(scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), -m4[2]), sum(scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m1[2])))), sum(sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m3[2]), sum(scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), -m4[2]), scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), m0[2]))), sum(scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m1[2]), sum(scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m3[2])))))
    var n = sum(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m2[2])), sum(scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m4[2]))), sum(sum(scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m0[2]), scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), -m1[2])), sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m4[2]))))
    var d = diff(p, n)
    return d[d.length - 1]
  }

    return exactInSphere5
}

function inSphere6(sum, diff, prod, scale) {
  function exactInSphere6(m0, m1, m2, m3, m4, m5) {
    var w0 = sum(sum(prod(m0[0], m0[0]), prod(m0[1], m0[1])), sum(prod(m0[2], m0[2]), prod(m0[3], m0[3])))
    var w0m1 = scale(w0, m1[0])
    var w0m2 = scale(w0, m2[0])
    var w0m3 = scale(w0, m3[0])
    var w0m4 = scale(w0, m4[0])
    var w0m5 = scale(w0, m5[0])
    var w1 = sum(sum(prod(m1[0], m1[0]), prod(m1[1], m1[1])), sum(prod(m1[2], m1[2]), prod(m1[3], m1[3])))
    var w1m0 = scale(w1, m0[0])
    var w1m2 = scale(w1, m2[0])
    var w1m3 = scale(w1, m3[0])
    var w1m4 = scale(w1, m4[0])
    var w1m5 = scale(w1, m5[0])
    var w2 = sum(sum(prod(m2[0], m2[0]), prod(m2[1], m2[1])), sum(prod(m2[2], m2[2]), prod(m2[3], m2[3])))
    var w2m0 = scale(w2, m0[0])
    var w2m1 = scale(w2, m1[0])
    var w2m3 = scale(w2, m3[0])
    var w2m4 = scale(w2, m4[0])
    var w2m5 = scale(w2, m5[0])
    var w3 = sum(sum(prod(m3[0], m3[0]), prod(m3[1], m3[1])), sum(prod(m3[2], m3[2]), prod(m3[3], m3[3])))
    var w3m0 = scale(w3, m0[0])
    var w3m1 = scale(w3, m1[0])
    var w3m2 = scale(w3, m2[0])
    var w3m4 = scale(w3, m4[0])
    var w3m5 = scale(w3, m5[0])
    var w4 = sum(sum(prod(m4[0], m4[0]), prod(m4[1], m4[1])), sum(prod(m4[2], m4[2]), prod(m4[3], m4[3])))
    var w4m0 = scale(w4, m0[0])
    var w4m1 = scale(w4, m1[0])
    var w4m2 = scale(w4, m2[0])
    var w4m3 = scale(w4, m3[0])
    var w4m5 = scale(w4, m5[0])
    var w5 = sum(sum(prod(m5[0], m5[0]), prod(m5[1], m5[1])), sum(prod(m5[2], m5[2]), prod(m5[3], m5[3])))
    var w5m0 = scale(w5, m0[0])
    var w5m1 = scale(w5, m1[0])
    var w5m2 = scale(w5, m2[0])
    var w5m3 = scale(w5, m3[0])
    var w5m4 = scale(w5, m4[0])
    var p = sum(sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m2[2]), scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), -m5[2]))), m1[3]), sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m1[2]), scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), -m5[2]))), -m2[3]), scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), m1[2]), scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m4[2]), scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), -m5[2]))), m3[3]))), sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m1[2]), scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), -m5[2]))), -m4[3]), scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m1[2]), scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), -m2[2])), sum(scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), -m4[2]))), m5[3])), sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m1[2]), scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), -m5[2]))), m0[3]), scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m5[2]))), -m1[3])))), sum(sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m4[2]), scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), -m5[2]))), m3[3]), scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), m0[2]), scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m3[2]), scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), -m5[2]))), -m4[3])), sum(scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m1[2])), sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m3[2]), scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), -m4[2]))), m5[3]), scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m1[2]), scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), -m5[2]))), m0[3]))), sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m0[2]), scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m5[2]))), -m1[3]), scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m3[1]), scale(diff(w3m1, w1m3), m5[1]))), m0[2]), scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m3[2]), scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), -m5[2]))), m2[3])), sum(scale(sum(sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m0[2]), scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m5[2]))), -m3[3]), scale(sum(sum(scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), m0[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m1[2])), sum(scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m3[2]))), m5[3])))))
    var n = sum(sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m2[2]), scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), -m5[2]))), m0[3]), sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m3[1]), sum(scale(diff(w5m3, w3m5), -m4[1]), scale(diff(w4m3, w3m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m3[2])), sum(scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), m4[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m5[2]))), -m2[3]), scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), m4[2]), scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), -m5[2]))), m3[3]))), sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m3, w3m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m3[1]), scale(diff(w3m2, w2m3), m5[1]))), m0[2]), scale(sum(scale(diff(w5m3, w3m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m3[1]), scale(diff(w3m0, w0m3), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m5[2]))), -m4[3]), scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m2[2])), sum(scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m4[2]))), m5[3])), sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), m1[2]), scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m4[2]), scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), -m5[2]))), m0[3]), scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m2[1]), sum(scale(diff(w5m2, w2m5), -m4[1]), scale(diff(w4m2, w2m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m2[2])), sum(scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), m4[2]), scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), -m5[2]))), -m1[3])))), sum(sum(sum(scale(sum(sum(scale(sum(scale(diff(w5m4, w4m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m4[1]), scale(diff(w4m1, w1m4), m5[1]))), m0[2]), scale(sum(scale(diff(w5m4, w4m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m4[1]), scale(diff(w4m0, w0m4), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m4[2]), scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), -m5[2]))), m2[3]), scale(sum(sum(scale(sum(scale(diff(w5m2, w2m5), m1[1]), sum(scale(diff(w5m1, w1m5), -m2[1]), scale(diff(w2m1, w1m2), m5[1]))), m0[2]), scale(sum(scale(diff(w5m2, w2m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m2[1]), scale(diff(w2m0, w0m2), m5[1]))), -m1[2])), sum(scale(sum(scale(diff(w5m1, w1m5), m0[1]), sum(scale(diff(w5m0, w0m5), -m1[1]), scale(diff(w1m0, w0m1), m5[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m5[2]))), -m4[3])), sum(scale(sum(sum(scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m0[2]), scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), -m1[2])), sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m4[2]))), m5[3]), scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m1[2]), scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), -m2[2])), sum(scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), -m4[2]))), m0[3]))), sum(sum(scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m2[1]), sum(scale(diff(w4m2, w2m4), -m3[1]), scale(diff(w3m2, w2m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m2[2])), sum(scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), m3[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m4[2]))), -m1[3]), scale(sum(sum(scale(sum(scale(diff(w4m3, w3m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m3[1]), scale(diff(w3m1, w1m3), m4[1]))), m0[2]), scale(sum(scale(diff(w4m3, w3m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m3[1]), scale(diff(w3m0, w0m3), m4[1]))), -m1[2])), sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m3[2]), scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), -m4[2]))), m2[3])), sum(scale(sum(sum(scale(sum(scale(diff(w4m2, w2m4), m1[1]), sum(scale(diff(w4m1, w1m4), -m2[1]), scale(diff(w2m1, w1m2), m4[1]))), m0[2]), scale(sum(scale(diff(w4m2, w2m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m2[1]), scale(diff(w2m0, w0m2), m4[1]))), -m1[2])), sum(scale(sum(scale(diff(w4m1, w1m4), m0[1]), sum(scale(diff(w4m0, w0m4), -m1[1]), scale(diff(w1m0, w0m1), m4[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m4[2]))), -m3[3]), scale(sum(sum(scale(sum(scale(diff(w3m2, w2m3), m1[1]), sum(scale(diff(w3m1, w1m3), -m2[1]), scale(diff(w2m1, w1m2), m3[1]))), m0[2]), scale(sum(scale(diff(w3m2, w2m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m2[1]), scale(diff(w2m0, w0m2), m3[1]))), -m1[2])), sum(scale(sum(scale(diff(w3m1, w1m3), m0[1]), sum(scale(diff(w3m0, w0m3), -m1[1]), scale(diff(w1m0, w0m1), m3[1]))), m2[2]), scale(sum(scale(diff(w2m1, w1m2), m0[1]), sum(scale(diff(w2m0, w0m2), -m1[1]), scale(diff(w1m0, w0m1), m2[1]))), -m3[2]))), m4[3])))))
    var d = diff(p, n)
    return d[d.length - 1]
  }
  return exactInSphere6
}

var CACHED = [
  inSphere0,
  inSphere1,
  inSphere2
]

function slowInSphere(args) {
  var proc = CACHED[args.length]
  if(!proc) {
    proc = CACHED[args.length] = orientation(args.length)
  }
  return proc.apply(undefined, args)
}

function proc(slow, o0, o1, o2, o3, o4, o5, o6) {
  function testInSphere(a0, a1, a2, a3, a4, a5) {
    switch (arguments.length) {
      case 0:
      case 1:
        return 0;
      case 2:
        return o2(a0, a1)
      case 3:
        return o3(a0, a1, a2)
      case 4:
        return o4(a0, a1, a2, a3)
      case 5:
        return o5(a0, a1, a2, a3, a4)
      case 6:
        return o6(a0, a1, a2, a3, a4, a5)
    }

    var s = new Array(arguments.length)
    for (var i = 0; i < arguments.length; ++i) {
      s[i] = arguments[i]
    }
    return slow(s)
  }
  return testInSphere
}

function generateInSphereTest() {
  while(CACHED.length <= NUM_EXPAND) {
    CACHED.push(orientation(CACHED.length))
  }

  module.exports = proc.apply(undefined, [slowInSphere].concat(CACHED))
  for(var i=0; i<=NUM_EXPAND; ++i) {
    module.exports[i] = CACHED[i]
  }
}

generateInSphereTest()