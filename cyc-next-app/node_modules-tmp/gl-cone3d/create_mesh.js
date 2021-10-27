'use strict'

var createShader  = require('gl-shader')
var createBuffer  = require('gl-buffer')
var createVAO     = require('gl-vao')
var createTexture = require('gl-texture2d')
var multiply      = require('gl-mat4/multiply')
var invert        = require('gl-mat4/invert')
var ndarray       = require('ndarray')
var colormap      = require('colormap')

var IDENTITY = [
  1,0,0,0,
  0,1,0,0,
  0,0,1,0,
  0,0,0,1]

function VectorMesh(gl
  , texture
  , triShader
  , pickShader
  , trianglePositions
  , triangleVectors
  , triangleIds
  , triangleColors
  , triangleUVs
  , triangleVAO
  , traceType) {

  this.gl                = gl
  this.pixelRatio         = 1
  this.cells             = []
  this.positions         = []
  this.intensity         = []
  this.texture           = texture
  this.dirty             = true

  this.triShader         = triShader
  this.pickShader        = pickShader

  this.trianglePositions = trianglePositions
  this.triangleVectors   = triangleVectors
  this.triangleColors    = triangleColors
  this.triangleUVs       = triangleUVs
  this.triangleIds       = triangleIds
  this.triangleVAO       = triangleVAO
  this.triangleCount     = 0

  this.pickId            = 1
  this.bounds            = [
    [ Infinity, Infinity, Infinity],
    [-Infinity,-Infinity,-Infinity] ]
  this.clipBounds        = [
    [-Infinity,-Infinity,-Infinity],
    [ Infinity, Infinity, Infinity] ]

  this.lightPosition = [1e5, 1e5, 0]
  this.ambientLight  = 0.8
  this.diffuseLight  = 0.8
  this.specularLight = 2.0
  this.roughness     = 0.5
  this.fresnel       = 1.5

  this.opacity       = 1

  this.traceType     = traceType
  this.tubeScale     = 1 // used in streamtube
  this.coneScale     = 2 // used in cone
  this.vectorScale   = 1 // used in cone
  this.coneOffset    = 0.25 // used in cone

  this._model       = IDENTITY
  this._view        = IDENTITY
  this._projection  = IDENTITY
  this._resolution  = [1,1]
}

var proto = VectorMesh.prototype

proto.isOpaque = function() {
  return this.opacity >= 1
}

proto.isTransparent = function() {
  return this.opacity < 1
}

proto.pickSlots = 1

proto.setPickBase = function(id) {
  this.pickId = id
}

function genColormap(param) {
  var colors = colormap({
      colormap: param
    , nshades:  256
    , format:  'rgba'
  })

  var result = new Uint8Array(256*4)
  for(var i=0; i<256; ++i) {
    var c = colors[i]
    for(var j=0; j<3; ++j) {
      result[4*i+j] = c[j]
    }
    result[4*i+3] = c[3]*255
  }

  return ndarray(result, [256,256,4], [4,0,1])
}

function takeZComponent(array) {
  var n = array.length
  var result = new Array(n)
  for(var i=0; i<n; ++i) {
    result[i] = array[i][2]
  }
  return result
}

proto.update = function(params) {
  params = params || {}
  var gl = this.gl

  this.dirty = true

  if('lightPosition' in params) {
    this.lightPosition = params.lightPosition
  }
  if('opacity' in params) {
    this.opacity = params.opacity
  }
  if('ambient' in params) {
    this.ambientLight  = params.ambient
  }
  if('diffuse' in params) {
    this.diffuseLight = params.diffuse
  }
  if('specular' in params) {
    this.specularLight = params.specular
  }
  if('roughness' in params) {
    this.roughness = params.roughness
  }
  if('fresnel' in params) {
    this.fresnel = params.fresnel
  }

  // use in streamtube
  if (params.tubeScale !== undefined) {
    this.tubeScale = params.tubeScale
  }

  // used in cone
  if (params.vectorScale !== undefined) {
    this.vectorScale = params.vectorScale
  }
  if (params.coneScale !== undefined) {
    this.coneScale = params.coneScale
  }
  if (params.coneOffset !== undefined) {
    this.coneOffset = params.coneOffset
  }

  if (params.colormap) {
    this.texture.shape = [256,256]
    this.texture.minFilter = gl.LINEAR_MIPMAP_LINEAR
    this.texture.magFilter = gl.LINEAR
    this.texture.setPixels(genColormap(params.colormap))
    this.texture.generateMipmap()
  }

  var cells = params.cells
  var positions = params.positions
  var vectors = params.vectors

  if(!positions || !cells || !vectors) {
    return
  }

  var tPos = []
  var tVec = []
  var tCol = []
  var tUVs = []
  var tIds = []

  //Save geometry data for picking calculations
  this.cells     = cells
  this.positions = positions
  this.vectors   = vectors

  //Compute colors
  var meshColor       = params.meshColor || [1,1,1,1]

  //UVs
  var vertexIntensity = params.vertexIntensity

  var intensityLo     = Infinity
  var intensityHi     = -Infinity

  if(vertexIntensity) {
    if(params.vertexIntensityBounds) {
      intensityLo = +params.vertexIntensityBounds[0]
      intensityHi = +params.vertexIntensityBounds[1]
    } else {
      for(var i=0; i<vertexIntensity.length; ++i) {
        var f = vertexIntensity[i]
        intensityLo = Math.min(intensityLo, f)
        intensityHi = Math.max(intensityHi, f)
      }
    }
  } else {
    for(var i=0; i<positions.length; ++i) {
      var f = positions[i][2]
      intensityLo = Math.min(intensityLo, f)
      intensityHi = Math.max(intensityHi, f)
    }
  }

  if(vertexIntensity) {
    this.intensity = vertexIntensity
  } else {
    this.intensity = takeZComponent(positions)
  }

  //Update bounds
  this.bounds       = [[Infinity,Infinity,Infinity], [-Infinity,-Infinity,-Infinity]]
  for(var i=0; i<positions.length; ++i) {
    var p = positions[i]
    for(var j=0; j<3; ++j) {
      if(isNaN(p[j]) || !isFinite(p[j])) {
        continue
      }
      this.bounds[0][j] = Math.min(this.bounds[0][j], p[j])
      this.bounds[1][j] = Math.max(this.bounds[1][j], p[j])
    }
  }

  //Pack cells into buffers
  var triangleCount = 0

fill_loop:
  for(var i=0; i<cells.length; ++i) {
    var cell = cells[i]
    switch(cell.length) {
      case 3:
        //Check NaNs
        for(var j=0; j<3; ++j) {
          var v = cell[j]
          var p = positions[v]
          for(var k=0; k<3; ++k) {
            if(isNaN(p[k]) || !isFinite(p[k])) {
              continue fill_loop
            }
          }
        }

        for(var j=0; j<3; ++j) {
          var v = cell[2 - j]

          var p = positions[v]
          tPos.push(p[0], p[1], p[2], p[3])

          var w = vectors[v]
          tVec.push(w[0], w[1], w[2], w[3] || 0)

          var c = meshColor
          if(c.length === 3) {
            tCol.push(c[0], c[1], c[2], 1)
          } else {
            tCol.push(c[0], c[1], c[2], c[3])
          }

          var uv
          if(vertexIntensity) {
            uv = [
              (vertexIntensity[v] - intensityLo) /
              (intensityHi - intensityLo), 0]
          } else {
            uv = [
              (p[2] - intensityLo) /
              (intensityHi - intensityLo), 0]
          }
          tUVs.push(uv[0], uv[1])

          tIds.push(i)
        }
        triangleCount += 1
      break

      default:
      break
    }
  }

  this.triangleCount  = triangleCount

  this.trianglePositions.update(tPos)
  this.triangleVectors.update(tVec)
  this.triangleColors.update(tCol)
  this.triangleUVs.update(tUVs)
  this.triangleIds.update(new Uint32Array(tIds))
}

proto.drawTransparent = proto.draw = function(params) {
  params = params || {}
  var gl          = this.gl
  var model       = params.model      || IDENTITY
  var view        = params.view       || IDENTITY
  var projection  = params.projection || IDENTITY

  var clipBounds = [[-1e6,-1e6,-1e6],[1e6,1e6,1e6]]
  for(var i=0; i<3; ++i) {
    clipBounds[0][i] = Math.max(clipBounds[0][i], this.clipBounds[0][i])
    clipBounds[1][i] = Math.min(clipBounds[1][i], this.clipBounds[1][i])
  }

  var uniforms = {
    model:      model,
    view:       view,
    projection: projection,
    inverseModel: IDENTITY.slice(),

    clipBounds: clipBounds,

    kambient:   this.ambientLight,
    kdiffuse:   this.diffuseLight,
    kspecular:  this.specularLight,
    roughness:  this.roughness,
    fresnel:    this.fresnel,

    eyePosition:   [0,0,0],
    lightPosition: [0,0,0],

    opacity:  this.opacity,

    tubeScale: this.tubeScale,

    vectorScale: this.vectorScale,
    coneScale: this.coneScale,
    coneOffset: this.coneOffset,

    texture:    0
  }

  uniforms.inverseModel = invert(uniforms.inverseModel, uniforms.model)

  gl.disable(gl.CULL_FACE)

  this.texture.bind(0)

  var invCameraMatrix = new Array(16)
  multiply(invCameraMatrix, uniforms.view, uniforms.model)
  multiply(invCameraMatrix, uniforms.projection, invCameraMatrix)
  invert(invCameraMatrix, invCameraMatrix)

  for(var i=0; i<3; ++i) {
    uniforms.eyePosition[i] = invCameraMatrix[12+i] / invCameraMatrix[15]
  }

  var w = invCameraMatrix[15]
  for(var i=0; i<3; ++i) {
    w += this.lightPosition[i] * invCameraMatrix[4*i+3]
  }
  for(var i=0; i<3; ++i) {
    var s = invCameraMatrix[12+i]
    for(var j=0; j<3; ++j) {
      s += invCameraMatrix[4*j+i] * this.lightPosition[j]
    }
    uniforms.lightPosition[i] = s / w
  }

  if(this.triangleCount > 0) {
    var shader = this.triShader
    shader.bind()
    shader.uniforms = uniforms

    this.triangleVAO.bind()
    gl.drawArrays(gl.TRIANGLES, 0, this.triangleCount*3)
    this.triangleVAO.unbind()
  }
}

proto.drawPick = function(params) {
  params = params || {}

  var gl         = this.gl

  var model      = params.model      || IDENTITY
  var view       = params.view       || IDENTITY
  var projection = params.projection || IDENTITY

  var clipBounds = [[-1e6,-1e6,-1e6],[1e6,1e6,1e6]]
  for(var i=0; i<3; ++i) {
    clipBounds[0][i] = Math.max(clipBounds[0][i], this.clipBounds[0][i])
    clipBounds[1][i] = Math.min(clipBounds[1][i], this.clipBounds[1][i])
  }

  //Save camera parameters
  this._model      = [].slice.call(model)
  this._view       = [].slice.call(view)
  this._projection = [].slice.call(projection)
  this._resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight]

  var uniforms = {
    model:      model,
    view:       view,
    projection: projection,
    clipBounds: clipBounds,

    tubeScale: this.tubeScale,
    vectorScale: this.vectorScale,
    coneScale: this.coneScale,
    coneOffset: this.coneOffset,

    pickId:     this.pickId / 255.0,
  }

  var shader = this.pickShader
  shader.bind()
  shader.uniforms = uniforms

  if(this.triangleCount > 0) {
    this.triangleVAO.bind()
    gl.drawArrays(gl.TRIANGLES, 0, this.triangleCount*3)
    this.triangleVAO.unbind()
  }
}


proto.pick = function(pickData) {
  if(!pickData) {
    return null
  }
  if(pickData.id !== this.pickId) {
    return null
  }

  var cellId    = pickData.value[0] + 256*pickData.value[1] + 65536*pickData.value[2]
  var cell      = this.cells[cellId]
  var pos =     this.positions[cell[1]].slice(0, 3)

  var result = {
    position: pos,
    dataCoordinate: pos,
    index: Math.floor(cell[1] / 48)
  }


  if(this.traceType === 'cone') {
    result.index = Math.floor(cell[1] / 48)
  } else if(this.traceType === 'streamtube') {
    result.intensity = this.intensity[cell[1]]
    result.velocity = this.vectors[cell[1]].slice(0, 3)
    result.divergence = this.vectors[cell[1]][3]
    result.index = cellId
  }

  return result
}


proto.dispose = function() {
  this.texture.dispose()

  this.triShader.dispose()
  this.pickShader.dispose()

  this.triangleVAO.dispose()
  this.trianglePositions.dispose()
  this.triangleVectors.dispose()
  this.triangleColors.dispose()
  this.triangleUVs.dispose()
  this.triangleIds.dispose()
}

function createMeshShader(gl, shaders) {
  var shader = createShader(gl,
    shaders.meshShader.vertex,
    shaders.meshShader.fragment,
    null,
    shaders.meshShader.attributes
  )

  shader.attributes.position.location = 0
  shader.attributes.color.location    = 2
  shader.attributes.uv.location       = 3
  shader.attributes.vector.location   = 4
  return shader
}


function createPickShader(gl, shaders) {
  var shader = createShader(gl,
    shaders.pickShader.vertex,
    shaders.pickShader.fragment,
    null,
    shaders.pickShader.attributes
  )

  shader.attributes.position.location = 0
  shader.attributes.id.location       = 1
  shader.attributes.vector.location   = 4
  return shader
}


function createVectorMesh(gl, params, opts) {
  var shaders = opts.shaders

  if (arguments.length === 1) {
    params = gl
    gl = params.gl
  }


  var triShader       = createMeshShader(gl, shaders)
  var pickShader      = createPickShader(gl, shaders)
  var meshTexture       = createTexture(gl,
    ndarray(new Uint8Array([255,255,255,255]), [1,1,4]))
  meshTexture.generateMipmap()
  meshTexture.minFilter = gl.LINEAR_MIPMAP_LINEAR
  meshTexture.magFilter = gl.LINEAR

  var trianglePositions = createBuffer(gl)
  var triangleVectors   = createBuffer(gl)
  var triangleColors    = createBuffer(gl)
  var triangleUVs       = createBuffer(gl)
  var triangleIds       = createBuffer(gl)
  var triangleVAO       = createVAO(gl, [
    { buffer: trianglePositions,
      type: gl.FLOAT,
      size: 4
    },
    { buffer: triangleIds,
      type: gl.UNSIGNED_BYTE,
      size: 4,
      normalized: true
    },
    { buffer: triangleColors,
      type: gl.FLOAT,
      size: 4
    },
    { buffer: triangleUVs,
      type: gl.FLOAT,
      size: 2
    },
    { buffer: triangleVectors,
      type: gl.FLOAT,
      size: 4
    }
  ])

  var mesh = new VectorMesh(gl
    , meshTexture
    , triShader
    , pickShader
    , trianglePositions
    , triangleVectors
    , triangleIds
    , triangleColors
    , triangleUVs
    , triangleVAO
    , opts.traceType || 'cone'
  )

  mesh.update(params)

  return mesh
}

module.exports = createVectorMesh
