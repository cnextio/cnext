'use strict'

module.exports = getPolygonizer

var allFns = [
  function cellPolygonizer_0() {
    function B(C, E, i, j) {
      var a = Math.min(i, j) | 0,
        b = Math.max(i, j) | 0,
        l = C[2 * a],
        h = C[2 * a + 1]
      while (l < h) {
        var m = (l + h) >> 1,
          v = E[2 * m + 1]
        if (v === b) {
          return m
        }
        if (b < v) {
          h = m
        } else {
          l = m + 1
        }
      }
      return l
    }
    function getContour0d(F, E, C, S) {
      var n = F.length,
        R = []
      for (var i = 0; i < n; ++i) {
        var c = F[i],
          l = c.length
      }
      return R
    }
    return getContour0d
  },
  function cellPolygonizer_1() {
    function B(C, E, i, j) {
      var a = Math.min(i, j) | 0,
        b = Math.max(i, j) | 0,
        l = C[2 * a],
        h = C[2 * a + 1]
      while (l < h) {
        var m = (l + h) >> 1,
          v = E[2 * m + 1]
        if (v === b) {
          return m
        }
        if (b < v) {
          h = m
        } else {
          l = m + 1
        }
      }
      return l
    }
    function getContour1d(F, E, C, S) {
      var n = F.length,
        R = []
      for (var i = 0; i < n; ++i) {
        var c = F[i],
          l = c.length
        if (l === 2) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1)
          if (M === 0 || M === 3) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[1])])
              break
            case 2:
              R.push([B(C, E, c[1], c[0])])
              break
            case 3:
              break
          }
        }
      }
      return R
    }
    return getContour1d
  },
  function cellPolygonizer_2() {
    function B(C, E, i, j) {
      var a = Math.min(i, j) | 0,
        b = Math.max(i, j) | 0,
        l = C[2 * a],
        h = C[2 * a + 1]
      while (l < h) {
        var m = (l + h) >> 1,
          v = E[2 * m + 1]
        if (v === b) {
          return m
        }
        if (b < v) {
          h = m
        } else {
          l = m + 1
        }
      }
      return l
    }
    function getContour2d(F, E, C, S) {
      var n = F.length,
        R = []
      for (var i = 0; i < n; ++i) {
        var c = F[i],
          l = c.length
        if (l === 3) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1) + (S[c[2]] << 2)
          if (M === 0 || M === 7) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[2]), B(C, E, c[0], c[1])])
              break
            case 2:
              R.push([B(C, E, c[1], c[0]), B(C, E, c[1], c[2])])
              break
            case 3:
              R.push([B(C, E, c[0], c[2]), B(C, E, c[1], c[2])])
              break
            case 4:
              R.push([B(C, E, c[2], c[1]), B(C, E, c[2], c[0])])
              break
            case 5:
              R.push([B(C, E, c[2], c[1]), B(C, E, c[0], c[1])])
              break
            case 6:
              R.push([B(C, E, c[1], c[0]), B(C, E, c[2], c[0])])
              break
            case 7:
              break
          }
        } else if (l === 2) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1)
          if (M === 0 || M === 3) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[1])])
              break
            case 2:
              R.push([B(C, E, c[1], c[0])])
              break
            case 3:
              break
          }
        }
      }
      return R
    }
    return getContour2d
  },
  function cellPolygonizer_3() {
    function B(C, E, i, j) {
      var a = Math.min(i, j) | 0,
        b = Math.max(i, j) | 0,
        l = C[2 * a],
        h = C[2 * a + 1]
      while (l < h) {
        var m = (l + h) >> 1,
          v = E[2 * m + 1]
        if (v === b) {
          return m
        }
        if (b < v) {
          h = m
        } else {
          l = m + 1
        }
      }
      return l
    }
    function getContour3d(F, E, C, S) {
      var n = F.length,
        R = []
      for (var i = 0; i < n; ++i) {
        var c = F[i],
          l = c.length
        if (l === 4) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1) + (S[c[2]] << 2) + (S[c[3]] << 3)
          if (M === 0 || M === 15) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[1]), B(C, E, c[0], c[2]), B(C, E, c[0], c[3])])
              break
            case 2:
              R.push([B(C, E, c[1], c[2]), B(C, E, c[1], c[0]), B(C, E, c[1], c[3])])
              break
            case 3:
              R.push([B(C, E, c[1], c[2]), B(C, E, c[0], c[2]), B(C, E, c[0], c[3])], [B(C, E, c[1], c[3]), B(C, E, c[1], c[2]), B(C, E, c[0], c[3])])
              break
            case 4:
              R.push([B(C, E, c[2], c[0]), B(C, E, c[2], c[1]), B(C, E, c[2], c[3])])
              break
            case 5:
              R.push([B(C, E, c[0], c[1]), B(C, E, c[2], c[1]), B(C, E, c[0], c[3])], [B(C, E, c[2], c[1]), B(C, E, c[2], c[3]), B(C, E, c[0], c[3])])
              break
            case 6:
              R.push([B(C, E, c[2], c[0]), B(C, E, c[1], c[0]), B(C, E, c[1], c[3])], [B(C, E, c[2], c[3]), B(C, E, c[2], c[0]), B(C, E, c[1], c[3])])
              break
            case 7:
              R.push([B(C, E, c[0], c[3]), B(C, E, c[1], c[3]), B(C, E, c[2], c[3])])
              break
            case 8:
              R.push([B(C, E, c[3], c[1]), B(C, E, c[3], c[0]), B(C, E, c[3], c[2])])
              break
            case 9:
              R.push([B(C, E, c[3], c[1]), B(C, E, c[0], c[1]), B(C, E, c[0], c[2])], [B(C, E, c[3], c[2]), B(C, E, c[3], c[1]), B(C, E, c[0], c[2])])
              break
            case 10:
              R.push([B(C, E, c[1], c[0]), B(C, E, c[3], c[0]), B(C, E, c[1], c[2])], [B(C, E, c[3], c[0]), B(C, E, c[3], c[2]), B(C, E, c[1], c[2])])
              break
            case 11:
              R.push([B(C, E, c[1], c[2]), B(C, E, c[0], c[2]), B(C, E, c[3], c[2])])
              break
            case 12:
              R.push([B(C, E, c[3], c[0]), B(C, E, c[2], c[0]), B(C, E, c[2], c[1])], [B(C, E, c[3], c[1]), B(C, E, c[3], c[0]), B(C, E, c[2], c[1])])
              break
            case 13:
              R.push([B(C, E, c[0], c[1]), B(C, E, c[2], c[1]), B(C, E, c[3], c[1])])
              break
            case 14:
              R.push([B(C, E, c[2], c[0]), B(C, E, c[1], c[0]), B(C, E, c[3], c[0])])
              break
            case 15:
              break
          }
        } else if (l === 3) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1) + (S[c[2]] << 2)
          if (M === 0 || M === 7) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[2]), B(C, E, c[0], c[1])])
              break
            case 2:
              R.push([B(C, E, c[1], c[0]), B(C, E, c[1], c[2])])
              break
            case 3:
              R.push([B(C, E, c[0], c[2]), B(C, E, c[1], c[2])])
              break
            case 4:
              R.push([B(C, E, c[2], c[1]), B(C, E, c[2], c[0])])
              break
            case 5:
              R.push([B(C, E, c[2], c[1]), B(C, E, c[0], c[1])])
              break
            case 6:
              R.push([B(C, E, c[1], c[0]), B(C, E, c[2], c[0])])
              break
            case 7:
              break
          }
        } else if (l === 2) {
          var M = (S[c[0]] << 0) + (S[c[1]] << 1)
          if (M === 0 || M === 3) {
            continue
          }
          switch (M) {
            case 0:
              break
            case 1:
              R.push([B(C, E, c[0], c[1])])
              break
            case 2:
              R.push([B(C, E, c[1], c[0])])
              break
            case 3:
              break
          }
        }
      }
      return R
    }
    return getContour3d
  }
]

function getPolygonizer(d) {
  return allFns[d]();
}
