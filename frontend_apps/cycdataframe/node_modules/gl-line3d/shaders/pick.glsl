precision highp float;

#define FLOAT_MAX  1.70141184e38
#define FLOAT_MIN  1.17549435e-38

// https://github.com/mikolalysenko/glsl-read-float/blob/master/index.glsl
vec4 packFloat(float v) {
  float av = abs(v);

  //Handle special cases
  if(av < FLOAT_MIN) {
    return vec4(0.0, 0.0, 0.0, 0.0);
  } else if(v > FLOAT_MAX) {
    return vec4(127.0, 128.0, 0.0, 0.0) / 255.0;
  } else if(v < -FLOAT_MAX) {
    return vec4(255.0, 128.0, 0.0, 0.0) / 255.0;
  }

  vec4 c = vec4(0,0,0,0);

  //Compute exponent and mantissa
  float e = floor(log2(av));
  float m = av * pow(2.0, -e) - 1.0;

  //Unpack mantissa
  c[1] = floor(128.0 * m);
  m -= c[1] / 128.0;
  c[2] = floor(32768.0 * m);
  m -= c[2] / 32768.0;
  c[3] = floor(8388608.0 * m);

  //Unpack exponent
  float ebias = e + 127.0;
  c[0] = floor(ebias / 2.0);
  ebias -= c[0] * 2.0;
  c[1] += floor(ebias) * 128.0;

  //Unpack sign bit
  c[0] += 128.0 * step(0.0, -v);

  //Scale back to range
  return c / 255.0;
}

#pragma glslify: outOfRange = require(glsl-out-of-range)

uniform float pickId;
uniform vec3 clipBounds[2];

varying vec3 worldPosition;
varying float pixelArcLength;
varying vec4 fragColor;

void main() {
  if (outOfRange(clipBounds[0], clipBounds[1], worldPosition)) discard;

  gl_FragColor = vec4(pickId/255.0, packFloat(pixelArcLength).xyz);
}