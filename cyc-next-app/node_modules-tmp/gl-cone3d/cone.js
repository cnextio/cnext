"use strict";

var vec3 = require('gl-vec3');

module.exports = function(vectorfield, bounds) {
	var positions = vectorfield.positions;
	var vectors = vectorfield.vectors;
	var geo = {
		positions: [],
		vertexIntensity: [],
		vertexIntensityBounds: vectorfield.vertexIntensityBounds,
		vectors: [],
		cells: [],
		coneOffset: vectorfield.coneOffset,
		colormap: vectorfield.colormap
	};

	if (vectorfield.positions.length === 0) {
		if (bounds) {
			bounds[0] = [0,0,0];
			bounds[1] = [0,0,0];
		}
		return geo;
	}

	// Compute bounding box for the dataset.
	// Compute maximum velocity for the dataset to use for scaling the cones.
	var maxNorm = 0;
	var minX = Infinity, maxX = -Infinity;
	var minY = Infinity, maxY = -Infinity;
	var minZ = Infinity, maxZ = -Infinity;
	var p2 = null;
	var u2 = null;
	var positionVectors = [];
	var vectorScale = Infinity;
	var skipIt = false;
	for (var i = 0; i < positions.length; i++) {
		var p = positions[i];
		minX = Math.min(p[0], minX);
		maxX = Math.max(p[0], maxX);
		minY = Math.min(p[1], minY);
		maxY = Math.max(p[1], maxY);
		minZ = Math.min(p[2], minZ);
		maxZ = Math.max(p[2], maxZ);
		var u = vectors[i];

		if (vec3.length(u) > maxNorm) {
			maxNorm = vec3.length(u);
		}
		if (i) {
			// Find vector scale [w/ units of time] using "successive" positions
			// (not "adjacent" with would be O(n^2)),
			//
			// The vector scale corresponds to the minimum "time" to travel across two
			// two adjacent positions at the average velocity of those two adjacent positions

			var q = (2 * vec3.distance(p2, p) / (vec3.length(u2) + vec3.length(u)));
			if(q) {
				vectorScale = Math.min(vectorScale, q);
				skipIt = false;
			} else {
				skipIt = true;
			}
		}
		if(!skipIt) {
			p2 = p;
			u2 = u;
		}
		positionVectors.push(u);
	}
	var minV = [minX, minY, minZ];
	var maxV = [maxX, maxY, maxZ];
	if (bounds) {
		bounds[0] = minV;
		bounds[1] = maxV;
	}
	if (maxNorm === 0) {
		maxNorm = 1;
	}

	// Inverted max norm would map vector with norm maxNorm to 1 coord space units in length
	var invertedMaxNorm = 1 / maxNorm;

	if (!isFinite(vectorScale)) {
		vectorScale = 1.0;
	}
	geo.vectorScale = vectorScale;

	var coneScale = vectorfield.coneSize || 0.5;

	if (vectorfield.absoluteConeSize) {
		coneScale = vectorfield.absoluteConeSize * invertedMaxNorm;
	}

	geo.coneScale = coneScale;

	// Build the cone model.
	for (var i = 0, j = 0; i < positions.length; i++) {
		var p = positions[i];
		var x = p[0], y = p[1], z = p[2];
		var d = positionVectors[i];
		var intensity = vec3.length(d) * invertedMaxNorm;
		for (var k = 0, l = 8; k < l; k++) {
			geo.positions.push([x, y, z, j++]);
			geo.positions.push([x, y, z, j++]);
			geo.positions.push([x, y, z, j++]);
			geo.positions.push([x, y, z, j++]);
			geo.positions.push([x, y, z, j++]);
			geo.positions.push([x, y, z, j++]);

			geo.vectors.push(d);
			geo.vectors.push(d);
			geo.vectors.push(d);
			geo.vectors.push(d);
			geo.vectors.push(d);
			geo.vectors.push(d);

			geo.vertexIntensity.push(intensity, intensity, intensity);
			geo.vertexIntensity.push(intensity, intensity, intensity);

			var m = geo.positions.length;
			geo.cells.push([m-6, m-5, m-4], [m-3, m-2, m-1]);
		}
	}

	return geo;
};

var shaders = require('./lib/shaders');
module.exports.createMesh = require('./create_mesh');
module.exports.createConeMesh = function(gl, params) {
	return module.exports.createMesh(gl, params, {
		shaders: shaders,
		traceType: 'cone'
	});
}
