var isBuffer = require("is-buffer")

var hasTypedArrays  = ((typeof Float64Array) !== "undefined")

function compare1st(a, b) {
  return a[0] - b[0]
}

function order() {
  var stride = this.stride
  var terms = new Array(stride.length)
  var i
  for(i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i]
  }
  terms.sort(compare1st)
  var result = new Array(terms.length)
  for(i=0; i<result.length; ++i) {
    result[i] = terms[i][1]
  }
  return result
}

var allFns = {
  // Special case for trivial arrays
  T: function (dtype) {
    function View(a) {
      this.data = a
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.index = function () {
      return -1
    }
    proto.size = 0
    proto.dimension = -1
    proto.shape = proto.stride = proto.order = []
    proto.lo =
      proto.hi =
      proto.transpose =
      proto.step =
        function () {
          return new View(this.data)
        }
    proto.get = proto.set = function () {}
    proto.pick = function () {
      return null
    }
    return function construct(a) {
      return new View(a)
    }
  },

  // Special case for 0d arrays
  0: function (dtype, TrivialArray) {
    function View(a, d) {
      this.data = a
      this.offset = d
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.index = function () {
      return this.offset
    }
    proto.dimension = 0
    proto.size = 1
    proto.shape = proto.stride = proto.order = []
    proto.lo =
      proto.hi =
      proto.transpose =
      proto.step =
        function copy() {
          return new View(this.data, this.offset)
        }
    proto.pick = function pick() {
      return TrivialArray(this.data)
    }
    proto.valueOf = proto.get = function get() {
      return dtype === "generic" ? this.data.get(this.offset) : this.data[this.offset]
    }
    proto.set = function set(v) {
      return dtype === "generic" ? this.data.set(this.offset, v) : (this.data[this.offset] = v)
    }
    return function construct(a, b, c, d) {
      return new View(a, d)
    }
  },

  1: function (dtype, CTOR_LIST, ORDER) {
    function View(a, b0, c0, d) {
      this.data = a
      this.shape = [b0]
      this.stride = [c0]
      this.offset = d | 0
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.dimension = 1
    Object.defineProperty(proto, "size", {
      get: function size() {
        return this.shape[0]
      },
    })
    proto.order = [0]
    proto.set = function set(i0, v) {
      return dtype === "generic"
        ? this.data.set(this.offset + this.stride[0] * i0, v)
        : (this.data[this.offset + this.stride[0] * i0] = v)
    }
    proto.get = function get(i0) {
      return dtype === "generic"
        ? this.data.get(this.offset + this.stride[0] * i0)
        : this.data[this.offset + this.stride[0] * i0]
    }
    proto.index = function index(i0) {
      return this.offset + this.stride[0] * i0
    }
    proto.hi = function hi(i0) {
      return new View(this.data, typeof i0 !== "number" || i0 < 0 ? this.shape[0] : i0 | 0, this.stride[0], this.offset)
    }
    proto.lo = function lo(i0) {
      var b = this.offset,
        d = 0,
        a0 = this.shape[0],
        c0 = this.stride[0]
      if (typeof i0 === "number" && i0 >= 0) {
        d = i0 | 0
        b += c0 * d
        a0 -= d
      }
      return new View(this.data, a0, c0, b)
    }
    proto.step = function step(i0) {
      var a0 = this.shape[0],
        b0 = this.stride[0],
        c = this.offset,
        d = 0,
        ceil = Math.ceil
      if (typeof i0 === "number") {
        d = i0 | 0
        if (d < 0) {
          c += b0 * (a0 - 1)
          a0 = ceil(-a0 / d)
        } else {
          a0 = ceil(a0 / d)
        }
        b0 *= d
      }
      return new View(this.data, a0, b0, c)
    }
    proto.transpose = function transpose(i0) {
      i0 = i0 === undefined ? 0 : i0 | 0
      var a = this.shape,
        b = this.stride
      return new View(this.data, a[i0], b[i0], this.offset)
    }
    proto.pick = function pick(i0) {
      var a = [],
        b = [],
        c = this.offset
      if (typeof i0 === "number" && i0 >= 0) {
        c = (c + this.stride[0] * i0) | 0
      } else {
        a.push(this.shape[0])
        b.push(this.stride[0])
      }
      var ctor = CTOR_LIST[a.length + 1]
      return ctor(this.data, a, b, c)
    }
    return function construct(data, shape, stride, offset) {
      return new View(data, shape[0], stride[0], offset)
    }
  },
  2: function (dtype, CTOR_LIST, ORDER) {
    function View(a, b0, b1, c0, c1, d) {
      this.data = a
      this.shape = [b0, b1]
      this.stride = [c0, c1]
      this.offset = d | 0
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.dimension = 2
    Object.defineProperty(proto, "size", {
      get: function size() {
        return this.shape[0] * this.shape[1]
      },
    })
    Object.defineProperty(proto, "order", {
      get: function order() {
        return Math.abs(this.stride[0]) > Math.abs(this.stride[1]) ? [1, 0] : [0, 1]
      },
    })
    proto.set = function set(i0, i1, v) {
      return dtype === "generic"
        ? this.data.set(this.offset + this.stride[0] * i0 + this.stride[1] * i1, v)
        : (this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1] = v)
    }
    proto.get = function get(i0, i1) {
      return dtype === "generic"
        ? this.data.get(this.offset + this.stride[0] * i0 + this.stride[1] * i1)
        : this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1]
    }
    proto.index = function index(i0, i1) {
      return this.offset + this.stride[0] * i0 + this.stride[1] * i1
    }
    proto.hi = function hi(i0, i1) {
      return new View(
        this.data,
        typeof i0 !== "number" || i0 < 0 ? this.shape[0] : i0 | 0,
        typeof i1 !== "number" || i1 < 0 ? this.shape[1] : i1 | 0,
        this.stride[0],
        this.stride[1],
        this.offset
      )
    }
    proto.lo = function lo(i0, i1) {
      var b = this.offset,
        d = 0,
        a0 = this.shape[0],
        a1 = this.shape[1],
        c0 = this.stride[0],
        c1 = this.stride[1]
      if (typeof i0 === "number" && i0 >= 0) {
        d = i0 | 0
        b += c0 * d
        a0 -= d
      }
      if (typeof i1 === "number" && i1 >= 0) {
        d = i1 | 0
        b += c1 * d
        a1 -= d
      }
      return new View(this.data, a0, a1, c0, c1, b)
    }
    proto.step = function step(i0, i1) {
      var a0 = this.shape[0],
        a1 = this.shape[1],
        b0 = this.stride[0],
        b1 = this.stride[1],
        c = this.offset,
        d = 0,
        ceil = Math.ceil
      if (typeof i0 === "number") {
        d = i0 | 0
        if (d < 0) {
          c += b0 * (a0 - 1)
          a0 = ceil(-a0 / d)
        } else {
          a0 = ceil(a0 / d)
        }
        b0 *= d
      }
      if (typeof i1 === "number") {
        d = i1 | 0
        if (d < 0) {
          c += b1 * (a1 - 1)
          a1 = ceil(-a1 / d)
        } else {
          a1 = ceil(a1 / d)
        }
        b1 *= d
      }
      return new View(this.data, a0, a1, b0, b1, c)
    }
    proto.transpose = function transpose(i0, i1) {
      i0 = i0 === undefined ? 0 : i0 | 0
      i1 = i1 === undefined ? 1 : i1 | 0
      var a = this.shape,
        b = this.stride
      return new View(this.data, a[i0], a[i1], b[i0], b[i1], this.offset)
    }
    proto.pick = function pick(i0, i1) {
      var a = [],
        b = [],
        c = this.offset
      if (typeof i0 === "number" && i0 >= 0) {
        c = (c + this.stride[0] * i0) | 0
      } else {
        a.push(this.shape[0])
        b.push(this.stride[0])
      }
      if (typeof i1 === "number" && i1 >= 0) {
        c = (c + this.stride[1] * i1) | 0
      } else {
        a.push(this.shape[1])
        b.push(this.stride[1])
      }
      var ctor = CTOR_LIST[a.length + 1]
      return ctor(this.data, a, b, c)
    }
    return function construct(data, shape, stride, offset) {
      return new View(data, shape[0], shape[1], stride[0], stride[1], offset)
    }
  },
  3: function (dtype, CTOR_LIST, ORDER) {
    function View(a, b0, b1, b2, c0, c1, c2, d) {
      this.data = a
      this.shape = [b0, b1, b2]
      this.stride = [c0, c1, c2]
      this.offset = d | 0
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.dimension = 3
    Object.defineProperty(proto, "size", {
      get: function size() {
        return this.shape[0] * this.shape[1] * this.shape[2]
      },
    })
    Object.defineProperty(proto, "order", {
      get: function order() {
        var s0 = Math.abs(this.stride[0]),
          s1 = Math.abs(this.stride[1]),
          s2 = Math.abs(this.stride[2])
        if (s0 > s1) {
          if (s1 > s2) {
            return [2, 1, 0]
          } else if (s0 > s2) {
            return [1, 2, 0]
          } else {
            return [1, 0, 2]
          }
        } else if (s0 > s2) {
          return [2, 0, 1]
        } else if (s2 > s1) {
          return [0, 1, 2]
        } else {
          return [0, 2, 1]
        }
      },
    })
    proto.set = function set(i0, i1, i2, v) {
      return dtype === "generic"
        ? this.data.set(this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2, v)
        : (this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2] = v)
    }
    proto.get = function get(i0, i1, i2) {
      return dtype === "generic"
        ? this.data.get(this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2)
        : this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2]
    }
    proto.index = function index(i0, i1, i2) {
      return this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2
    }
    proto.hi = function hi(i0, i1, i2) {
      return new View(
        this.data,
        typeof i0 !== "number" || i0 < 0 ? this.shape[0] : i0 | 0,
        typeof i1 !== "number" || i1 < 0 ? this.shape[1] : i1 | 0,
        typeof i2 !== "number" || i2 < 0 ? this.shape[2] : i2 | 0,
        this.stride[0],
        this.stride[1],
        this.stride[2],
        this.offset
      )
    }
    proto.lo = function lo(i0, i1, i2) {
      var b = this.offset,
        d = 0,
        a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        c0 = this.stride[0],
        c1 = this.stride[1],
        c2 = this.stride[2]
      if (typeof i0 === "number" && i0 >= 0) {
        d = i0 | 0
        b += c0 * d
        a0 -= d
      }
      if (typeof i1 === "number" && i1 >= 0) {
        d = i1 | 0
        b += c1 * d
        a1 -= d
      }
      if (typeof i2 === "number" && i2 >= 0) {
        d = i2 | 0
        b += c2 * d
        a2 -= d
      }
      return new View(this.data, a0, a1, a2, c0, c1, c2, b)
    }
    proto.step = function step(i0, i1, i2) {
      var a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        b0 = this.stride[0],
        b1 = this.stride[1],
        b2 = this.stride[2],
        c = this.offset,
        d = 0,
        ceil = Math.ceil
      if (typeof i0 === "number") {
        d = i0 | 0
        if (d < 0) {
          c += b0 * (a0 - 1)
          a0 = ceil(-a0 / d)
        } else {
          a0 = ceil(a0 / d)
        }
        b0 *= d
      }
      if (typeof i1 === "number") {
        d = i1 | 0
        if (d < 0) {
          c += b1 * (a1 - 1)
          a1 = ceil(-a1 / d)
        } else {
          a1 = ceil(a1 / d)
        }
        b1 *= d
      }
      if (typeof i2 === "number") {
        d = i2 | 0
        if (d < 0) {
          c += b2 * (a2 - 1)
          a2 = ceil(-a2 / d)
        } else {
          a2 = ceil(a2 / d)
        }
        b2 *= d
      }
      return new View(this.data, a0, a1, a2, b0, b1, b2, c)
    }
    proto.transpose = function transpose(i0, i1, i2) {
      i0 = i0 === undefined ? 0 : i0 | 0
      i1 = i1 === undefined ? 1 : i1 | 0
      i2 = i2 === undefined ? 2 : i2 | 0
      var a = this.shape,
        b = this.stride
      return new View(this.data, a[i0], a[i1], a[i2], b[i0], b[i1], b[i2], this.offset)
    }
    proto.pick = function pick(i0, i1, i2) {
      var a = [],
        b = [],
        c = this.offset
      if (typeof i0 === "number" && i0 >= 0) {
        c = (c + this.stride[0] * i0) | 0
      } else {
        a.push(this.shape[0])
        b.push(this.stride[0])
      }
      if (typeof i1 === "number" && i1 >= 0) {
        c = (c + this.stride[1] * i1) | 0
      } else {
        a.push(this.shape[1])
        b.push(this.stride[1])
      }
      if (typeof i2 === "number" && i2 >= 0) {
        c = (c + this.stride[2] * i2) | 0
      } else {
        a.push(this.shape[2])
        b.push(this.stride[2])
      }
      var ctor = CTOR_LIST[a.length + 1]
      return ctor(this.data, a, b, c)
    }
    return function construct(data, shape, stride, offset) {
      return new View(data, shape[0], shape[1], shape[2], stride[0], stride[1], stride[2], offset)
    }
  },
  4: function (dtype, CTOR_LIST, ORDER) {
    function View(a, b0, b1, b2, b3, c0, c1, c2, c3, d) {
      this.data = a
      this.shape = [b0, b1, b2, b3]
      this.stride = [c0, c1, c2, c3]
      this.offset = d | 0
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.dimension = 4
    Object.defineProperty(proto, "size", {
      get: function size() {
        return this.shape[0] * this.shape[1] * this.shape[2] * this.shape[3]
      },
    })
    Object.defineProperty(proto, "order", { get: ORDER })
    proto.set = function set(i0, i1, i2, i3, v) {
      return dtype === "generic"
        ? this.data.set(this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2 + this.stride[3] * i3, v)
        : (this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2 + this.stride[3] * i3] = v)
    }
    proto.get = function get(i0, i1, i2, i3) {
      return dtype === "generic"
        ? this.data.get(this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2 + this.stride[3] * i3)
        : this.data[this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2 + this.stride[3] * i3]
    }
    proto.index = function index(i0, i1, i2, i3) {
      return this.offset + this.stride[0] * i0 + this.stride[1] * i1 + this.stride[2] * i2 + this.stride[3] * i3
    }
    proto.hi = function hi(i0, i1, i2, i3) {
      return new View(
        this.data,
        typeof i0 !== "number" || i0 < 0 ? this.shape[0] : i0 | 0,
        typeof i1 !== "number" || i1 < 0 ? this.shape[1] : i1 | 0,
        typeof i2 !== "number" || i2 < 0 ? this.shape[2] : i2 | 0,
        typeof i3 !== "number" || i3 < 0 ? this.shape[3] : i3 | 0,
        this.stride[0],
        this.stride[1],
        this.stride[2],
        this.stride[3],
        this.offset
      )
    }
    proto.lo = function lo(i0, i1, i2, i3) {
      var b = this.offset,
        d = 0,
        a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        a3 = this.shape[3],
        c0 = this.stride[0],
        c1 = this.stride[1],
        c2 = this.stride[2],
        c3 = this.stride[3]
      if (typeof i0 === "number" && i0 >= 0) {
        d = i0 | 0
        b += c0 * d
        a0 -= d
      }
      if (typeof i1 === "number" && i1 >= 0) {
        d = i1 | 0
        b += c1 * d
        a1 -= d
      }
      if (typeof i2 === "number" && i2 >= 0) {
        d = i2 | 0
        b += c2 * d
        a2 -= d
      }
      if (typeof i3 === "number" && i3 >= 0) {
        d = i3 | 0
        b += c3 * d
        a3 -= d
      }
      return new View(this.data, a0, a1, a2, a3, c0, c1, c2, c3, b)
    }
    proto.step = function step(i0, i1, i2, i3) {
      var a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        a3 = this.shape[3],
        b0 = this.stride[0],
        b1 = this.stride[1],
        b2 = this.stride[2],
        b3 = this.stride[3],
        c = this.offset,
        d = 0,
        ceil = Math.ceil
      if (typeof i0 === "number") {
        d = i0 | 0
        if (d < 0) {
          c += b0 * (a0 - 1)
          a0 = ceil(-a0 / d)
        } else {
          a0 = ceil(a0 / d)
        }
        b0 *= d
      }
      if (typeof i1 === "number") {
        d = i1 | 0
        if (d < 0) {
          c += b1 * (a1 - 1)
          a1 = ceil(-a1 / d)
        } else {
          a1 = ceil(a1 / d)
        }
        b1 *= d
      }
      if (typeof i2 === "number") {
        d = i2 | 0
        if (d < 0) {
          c += b2 * (a2 - 1)
          a2 = ceil(-a2 / d)
        } else {
          a2 = ceil(a2 / d)
        }
        b2 *= d
      }
      if (typeof i3 === "number") {
        d = i3 | 0
        if (d < 0) {
          c += b3 * (a3 - 1)
          a3 = ceil(-a3 / d)
        } else {
          a3 = ceil(a3 / d)
        }
        b3 *= d
      }
      return new View(this.data, a0, a1, a2, a3, b0, b1, b2, b3, c)
    }
    proto.transpose = function transpose(i0, i1, i2, i3) {
      i0 = i0 === undefined ? 0 : i0 | 0
      i1 = i1 === undefined ? 1 : i1 | 0
      i2 = i2 === undefined ? 2 : i2 | 0
      i3 = i3 === undefined ? 3 : i3 | 0
      var a = this.shape,
        b = this.stride
      return new View(this.data, a[i0], a[i1], a[i2], a[i3], b[i0], b[i1], b[i2], b[i3], this.offset)
    }
    proto.pick = function pick(i0, i1, i2, i3) {
      var a = [],
        b = [],
        c = this.offset
      if (typeof i0 === "number" && i0 >= 0) {
        c = (c + this.stride[0] * i0) | 0
      } else {
        a.push(this.shape[0])
        b.push(this.stride[0])
      }
      if (typeof i1 === "number" && i1 >= 0) {
        c = (c + this.stride[1] * i1) | 0
      } else {
        a.push(this.shape[1])
        b.push(this.stride[1])
      }
      if (typeof i2 === "number" && i2 >= 0) {
        c = (c + this.stride[2] * i2) | 0
      } else {
        a.push(this.shape[2])
        b.push(this.stride[2])
      }
      if (typeof i3 === "number" && i3 >= 0) {
        c = (c + this.stride[3] * i3) | 0
      } else {
        a.push(this.shape[3])
        b.push(this.stride[3])
      }
      var ctor = CTOR_LIST[a.length + 1]
      return ctor(this.data, a, b, c)
    }
    return function construct(data, shape, stride, offset) {
      return new View(data, shape[0], shape[1], shape[2], shape[3], stride[0], stride[1], stride[2], stride[3], offset)
    }
  },
  5: function anonymous(dtype, CTOR_LIST, ORDER) {
    function View(a, b0, b1, b2, b3, b4, c0, c1, c2, c3, c4, d) {
      this.data = a
      this.shape = [b0, b1, b2, b3, b4]
      this.stride = [c0, c1, c2, c3, c4]
      this.offset = d | 0
    }
    var proto = View.prototype
    proto.dtype = dtype
    proto.dimension = 5
    Object.defineProperty(proto, "size", {
      get: function size() {
        return this.shape[0] * this.shape[1] * this.shape[2] * this.shape[3] * this.shape[4]
      },
    })
    Object.defineProperty(proto, "order", { get: ORDER })
    proto.set = function set(i0, i1, i2, i3, i4, v) {
      return dtype === "generic"
        ? this.data.set(
            this.offset +
              this.stride[0] * i0 +
              this.stride[1] * i1 +
              this.stride[2] * i2 +
              this.stride[3] * i3 +
              this.stride[4] * i4,
            v
          )
        : (this.data[
            this.offset +
              this.stride[0] * i0 +
              this.stride[1] * i1 +
              this.stride[2] * i2 +
              this.stride[3] * i3 +
              this.stride[4] * i4
          ] = v)
    }
    proto.get = function get(i0, i1, i2, i3, i4) {
      return dtype === "generic"
        ? this.data.get(
            this.offset +
              this.stride[0] * i0 +
              this.stride[1] * i1 +
              this.stride[2] * i2 +
              this.stride[3] * i3 +
              this.stride[4] * i4
          )
        : this.data[
            this.offset +
              this.stride[0] * i0 +
              this.stride[1] * i1 +
              this.stride[2] * i2 +
              this.stride[3] * i3 +
              this.stride[4] * i4
          ]
    }
    proto.index = function index(i0, i1, i2, i3, i4) {
      return (
        this.offset +
        this.stride[0] * i0 +
        this.stride[1] * i1 +
        this.stride[2] * i2 +
        this.stride[3] * i3 +
        this.stride[4] * i4
      )
    }
    proto.hi = function hi(i0, i1, i2, i3, i4) {
      return new View(
        this.data,
        typeof i0 !== "number" || i0 < 0 ? this.shape[0] : i0 | 0,
        typeof i1 !== "number" || i1 < 0 ? this.shape[1] : i1 | 0,
        typeof i2 !== "number" || i2 < 0 ? this.shape[2] : i2 | 0,
        typeof i3 !== "number" || i3 < 0 ? this.shape[3] : i3 | 0,
        typeof i4 !== "number" || i4 < 0 ? this.shape[4] : i4 | 0,
        this.stride[0],
        this.stride[1],
        this.stride[2],
        this.stride[3],
        this.stride[4],
        this.offset
      )
    }
    proto.lo = function lo(i0, i1, i2, i3, i4) {
      var b = this.offset,
        d = 0,
        a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        a3 = this.shape[3],
        a4 = this.shape[4],
        c0 = this.stride[0],
        c1 = this.stride[1],
        c2 = this.stride[2],
        c3 = this.stride[3],
        c4 = this.stride[4]
      if (typeof i0 === "number" && i0 >= 0) {
        d = i0 | 0
        b += c0 * d
        a0 -= d
      }
      if (typeof i1 === "number" && i1 >= 0) {
        d = i1 | 0
        b += c1 * d
        a1 -= d
      }
      if (typeof i2 === "number" && i2 >= 0) {
        d = i2 | 0
        b += c2 * d
        a2 -= d
      }
      if (typeof i3 === "number" && i3 >= 0) {
        d = i3 | 0
        b += c3 * d
        a3 -= d
      }
      if (typeof i4 === "number" && i4 >= 0) {
        d = i4 | 0
        b += c4 * d
        a4 -= d
      }
      return new View(this.data, a0, a1, a2, a3, a4, c0, c1, c2, c3, c4, b)
    }
    proto.step = function step(i0, i1, i2, i3, i4) {
      var a0 = this.shape[0],
        a1 = this.shape[1],
        a2 = this.shape[2],
        a3 = this.shape[3],
        a4 = this.shape[4],
        b0 = this.stride[0],
        b1 = this.stride[1],
        b2 = this.stride[2],
        b3 = this.stride[3],
        b4 = this.stride[4],
        c = this.offset,
        d = 0,
        ceil = Math.ceil
      if (typeof i0 === "number") {
        d = i0 | 0
        if (d < 0) {
          c += b0 * (a0 - 1)
          a0 = ceil(-a0 / d)
        } else {
          a0 = ceil(a0 / d)
        }
        b0 *= d
      }
      if (typeof i1 === "number") {
        d = i1 | 0
        if (d < 0) {
          c += b1 * (a1 - 1)
          a1 = ceil(-a1 / d)
        } else {
          a1 = ceil(a1 / d)
        }
        b1 *= d
      }
      if (typeof i2 === "number") {
        d = i2 | 0
        if (d < 0) {
          c += b2 * (a2 - 1)
          a2 = ceil(-a2 / d)
        } else {
          a2 = ceil(a2 / d)
        }
        b2 *= d
      }
      if (typeof i3 === "number") {
        d = i3 | 0
        if (d < 0) {
          c += b3 * (a3 - 1)
          a3 = ceil(-a3 / d)
        } else {
          a3 = ceil(a3 / d)
        }
        b3 *= d
      }
      if (typeof i4 === "number") {
        d = i4 | 0
        if (d < 0) {
          c += b4 * (a4 - 1)
          a4 = ceil(-a4 / d)
        } else {
          a4 = ceil(a4 / d)
        }
        b4 *= d
      }
      return new View(this.data, a0, a1, a2, a3, a4, b0, b1, b2, b3, b4, c)
    }
    proto.transpose = function transpose(i0, i1, i2, i3, i4) {
      i0 = i0 === undefined ? 0 : i0 | 0
      i1 = i1 === undefined ? 1 : i1 | 0
      i2 = i2 === undefined ? 2 : i2 | 0
      i3 = i3 === undefined ? 3 : i3 | 0
      i4 = i4 === undefined ? 4 : i4 | 0
      var a = this.shape,
        b = this.stride
      return new View(this.data, a[i0], a[i1], a[i2], a[i3], a[i4], b[i0], b[i1], b[i2], b[i3], b[i4], this.offset)
    }
    proto.pick = function pick(i0, i1, i2, i3, i4) {
      var a = [],
        b = [],
        c = this.offset
      if (typeof i0 === "number" && i0 >= 0) {
        c = (c + this.stride[0] * i0) | 0
      } else {
        a.push(this.shape[0])
        b.push(this.stride[0])
      }
      if (typeof i1 === "number" && i1 >= 0) {
        c = (c + this.stride[1] * i1) | 0
      } else {
        a.push(this.shape[1])
        b.push(this.stride[1])
      }
      if (typeof i2 === "number" && i2 >= 0) {
        c = (c + this.stride[2] * i2) | 0
      } else {
        a.push(this.shape[2])
        b.push(this.stride[2])
      }
      if (typeof i3 === "number" && i3 >= 0) {
        c = (c + this.stride[3] * i3) | 0
      } else {
        a.push(this.shape[3])
        b.push(this.stride[3])
      }
      if (typeof i4 === "number" && i4 >= 0) {
        c = (c + this.stride[4] * i4) | 0
      } else {
        a.push(this.shape[4])
        b.push(this.stride[4])
      }
      var ctor = CTOR_LIST[a.length + 1]
      return ctor(this.data, a, b, c)
    }
    return function construct(data, shape, stride, offset) {
      return new View(
        data,
        shape[0],
        shape[1],
        shape[2],
        shape[3],
        shape[4],
        stride[0],
        stride[1],
        stride[2],
        stride[3],
        stride[4],
        offset
      )
    }
  },
}


function compileConstructor(inType, inDimension) {
  var dKey = inDimension === -1 ? 'T' : String(inDimension)

  var procedure = allFns[dKey]
  if(inDimension === -1) {
    return procedure(inType)
  } else if(inDimension === 0) {
    return procedure(inType, CACHED_CONSTRUCTORS[inType][0])
  }
  return procedure(inType, CACHED_CONSTRUCTORS[inType], order)
}

function arrayDType(data) {
  if(isBuffer(data)) {
    return "buffer"
  }
  if(hasTypedArrays) {
    switch(Object.prototype.toString.call(data)) {
      case "[object Float64Array]":
        return "float64"
      case "[object Float32Array]":
        return "float32"
      case "[object Int8Array]":
        return "int8"
      case "[object Int16Array]":
        return "int16"
      case "[object Int32Array]":
        return "int32"
      case "[object Uint8ClampedArray]":
        return "uint8_clamped"
      case "[object Uint8Array]":
        return "uint8"
      case "[object Uint16Array]":
        return "uint16"
      case "[object Uint32Array]":
        return "uint32"
      case "[object BigInt64Array]":
        return "bigint64"
      case "[object BigUint64Array]":
        return "biguint64"
    }
  }
  if(Array.isArray(data)) {
    return "array"
  }
  return "generic"
}

var CACHED_CONSTRUCTORS = {
  "generic":[],
  "buffer":[],
  "array":[],

  // typed arrays
  "float32":[],
  "float64":[],
  "int8":[],
  "int16":[],
  "int32":[],
  "uint8_clamped":[],
  "uint8":[],
  "uint16":[],
  "uint32":[],
  "bigint64": [],
  "biguint64": []
}

;(function() {
  for(var id in CACHED_CONSTRUCTORS) {
    CACHED_CONSTRUCTORS[id].push(compileConstructor(id, -1))
  }
});

function wrappedNDArrayCtor(data, shape, stride, offset) {
  if(data === undefined) {
    var ctor = CACHED_CONSTRUCTORS.array[0]
    return ctor([])
  } else if(typeof data === "number") {
    data = [data]
  }
  if(shape === undefined) {
    shape = [ data.length ]
  }
  var d = shape.length
  if(stride === undefined) {
    stride = new Array(d)
    for(var i=d-1, sz=1; i>=0; --i) {
      stride[i] = sz
      sz *= shape[i]
    }
  }
  if(offset === undefined) {
    offset = 0
    for(var i=0; i<d; ++i) {
      if(stride[i] < 0) {
        offset -= (shape[i]-1)*stride[i]
      }
    }
  }
  var inType = arrayDType(data)
  var ctor_list = CACHED_CONSTRUCTORS[inType]
  while(ctor_list.length <= d+1) {
    ctor_list.push(compileConstructor(inType, ctor_list.length-1))
  }
  var ctor = ctor_list[d+1]
  return ctor(data, shape, stride, offset)
}

module.exports = wrappedNDArrayCtor
