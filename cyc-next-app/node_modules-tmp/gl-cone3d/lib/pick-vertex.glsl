precision highp float;

#pragma glslify: getConePosition = require(./cone-position.glsl)

attribute vec4 vector;
attribute vec4 position;
attribute vec4 id;

uniform mat4 model, view, projection;
uniform float vectorScale, coneScale, coneOffset;

varying vec3 f_position;
varying vec4 f_id;

void main() {
  vec3 normal;
  vec3 XYZ = getConePosition(mat3(model) * ((vectorScale * coneScale) * vector.xyz), position.w, coneOffset, normal);
  vec4 conePosition = model * vec4(position.xyz, 1.0) + vec4(XYZ, 0.0);
  gl_Position = projection * view * conePosition;
  f_id        = id;
  f_position  = position.xyz;
}
