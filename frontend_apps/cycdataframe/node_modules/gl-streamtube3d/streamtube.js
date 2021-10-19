"use strict";

var vec3 = require('gl-vec3');
var vec4 = require('gl-vec4');
var GRID_TYPES = ['xyz', 'xzy', 'yxz', 'yzx', 'zxy', 'zyx'];

var streamToTube = function(stream, maxDivergence, minDistance, maxNorm) {
	var points = stream.points;
	var velocities = stream.velocities;
	var divergences = stream.divergences;

	var verts = [];
	var faces = [];
	var vectors = [];
	var previousVerts = [];
	var currentVerts = [];
	var intensities = [];
	var previousIntensity = 0;
	var currentIntensity = 0;
	var currentVector = vec4.create();
	var previousVector = vec4.create();

	var facets = 8;

	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		var fwd = velocities[i];
		var r = divergences[i];
		if (maxDivergence === 0) {
			r = minDistance * 0.05;
		}
		currentIntensity = vec3.length(fwd) / maxNorm;

		currentVector = vec4.create();
		vec3.copy(currentVector, fwd);
		currentVector[3] = r;

		for (var a = 0; a < facets; a++) {
			currentVerts[a] = [p[0], p[1], p[2], a];
		}
		if (previousVerts.length > 0) {
			for (var a = 0; a < facets; a++) {
				var a1 = (a+1) % facets;
				verts.push(
					previousVerts[a],
					currentVerts[a],
					currentVerts[a1],

					currentVerts[a1],
					previousVerts[a1],
					previousVerts[a]
				);
				vectors.push(
					previousVector,
					currentVector,
					currentVector,

					currentVector,
					previousVector,
					previousVector
				);
				intensities.push(
					previousIntensity,
					currentIntensity,
					currentIntensity,

					currentIntensity,
					previousIntensity,
					previousIntensity
				);

				var len = verts.length;
				faces.push(
					[len-6, len-5, len-4],
					[len-3, len-2, len-1]
				);
			}
		}
		var tmp1 = previousVerts;
		previousVerts = currentVerts;
		currentVerts = tmp1;

		var tmp2 = previousVector;
		previousVector = currentVector;
		currentVector = tmp2;

		var tmp3 = previousIntensity;
		previousIntensity = currentIntensity;
		currentIntensity = tmp3;
	}
	return {
		positions: verts,
		cells: faces,
		vectors: vectors,
		vertexIntensity: intensities
	};
};

var createTubes = function(streams, colormap, maxDivergence, minDistance) {

	var maxNorm = 0;
	for (var i=0; i<streams.length; i++) {
		var velocities = streams[i].velocities;
		for (var j=0; j<velocities.length; j++) {
			maxNorm = Math.max(maxNorm,
				vec3.length(velocities[j])
			);
		}
	}

	var tubes = streams.map(function(s) {
		return streamToTube(s, maxDivergence, minDistance, maxNorm);
	});

	var positions = [];
	var cells = [];
	var vectors = [];
	var vertexIntensity = [];
	for (var i=0; i < tubes.length; i++) {
		var tube = tubes[i];
		var offset = positions.length;
		positions = positions.concat(tube.positions);
		vectors = vectors.concat(tube.vectors);
		vertexIntensity = vertexIntensity.concat(tube.vertexIntensity);
		for (var j=0; j<tube.cells.length; j++) {
			var cell = tube.cells[j];
			var newCell = [];
			cells.push(newCell);
			for (var k=0; k<cell.length; k++) {
				newCell.push(cell[k] + offset);
			}
		}
	}
	return {
		positions: positions,
		cells: cells,
		vectors: vectors,
		vertexIntensity: vertexIntensity,
		colormap: colormap
	};
};

var findLastSmallerIndex = function(points, v) {
  var len = points.length;
  var i;
  for (i=0; i<len; i++) {
  	var p = points[i];
  	if (p === v) return i;
    else if (p > v) return i-1;
  }
  return i;
};

var clamp = function(v, min, max) {
	return v < min ? min : (v > max ? max : v);
};

var sampleMeshgrid = function(point, vectorField, gridInfo) {
	var vectors = vectorField.vectors;
	var meshgrid = vectorField.meshgrid;

	var x = point[0];
	var y = point[1];
	var z = point[2];

	var w = meshgrid[0].length;
	var h = meshgrid[1].length;
	var d = meshgrid[2].length;

	// Find the index of the nearest smaller value in the meshgrid for each coordinate of (x,y,z).
	// The nearest smaller value index for x is the index x0 such that
	// meshgrid[0][x0] < x and for all x1 > x0, meshgrid[0][x1] >= x.
	var x0 = findLastSmallerIndex(meshgrid[0], x);
	var y0 = findLastSmallerIndex(meshgrid[1], y);
	var z0 = findLastSmallerIndex(meshgrid[2], z);

	// Get the nearest larger meshgrid value indices.
	// From the above "nearest smaller value", we know that
	//   meshgrid[0][x0] < x
	//   meshgrid[0][x0+1] >= x
	var x1 = x0 + 1;
	var y1 = y0 + 1;
	var z1 = z0 + 1;

	x0 = clamp(x0, 0, w-1);
	x1 = clamp(x1, 0, w-1);
	y0 = clamp(y0, 0, h-1);
	y1 = clamp(y1, 0, h-1);
	z0 = clamp(z0, 0, d-1);
	z1 = clamp(z1, 0, d-1);

	// Reject points outside the meshgrid, return a zero vector.
	if (x0 < 0 || y0 < 0 || z0 < 0 || x1 > w-1 || y1 > h-1 || z1 > d-1) {
		return vec3.create();
	}

	// Normalize point coordinates to 0..1 scaling factor between x0 and x1.
	var mX0 = meshgrid[0][x0];
	var mX1 = meshgrid[0][x1];
	var mY0 = meshgrid[1][y0];
	var mY1 = meshgrid[1][y1];
	var mZ0 = meshgrid[2][z0];
	var mZ1 = meshgrid[2][z1];
	var xf = (x - mX0) / (mX1 - mX0);
	var yf = (y - mY0) / (mY1 - mY0);
	var zf = (z - mZ0) / (mZ1 - mZ0);

	if (!isFinite(xf)) xf = 0.5;
	if (!isFinite(yf)) yf = 0.5;
	if (!isFinite(zf)) zf = 0.5;

	var x0off;
	var x1off;
	var y0off;
	var y1off;
	var z0off;
	var z1off;

	if(gridInfo.reversedX) {
		x0 = w - 1 - x0;
		x1 = w - 1 - x1;
	}

	if(gridInfo.reversedY) {
		y0 = h - 1 - y0;
		y1 = h - 1 - y1;
	}

	if(gridInfo.reversedZ) {
		z0 = d - 1 - z0;
		z1 = d - 1 - z1;
	}

	switch(gridInfo.filled) {
		case 5: // 'zyx'
			z0off = z0;
			z1off = z1;
			y0off = y0*d;
			y1off = y1*d;
			x0off = x0*d*h;
			x1off = x1*d*h;
			break;

		case 4: // 'zxy'
			z0off = z0;
			z1off = z1;
			x0off = x0*d;
			x1off = x1*d;
			y0off = y0*d*w;
			y1off = y1*d*w;
			break;

		case 3: // 'yzx'
			y0off = y0;
			y1off = y1;
			z0off = z0*h;
			z1off = z1*h;
			x0off = x0*h*d;
			x1off = x1*h*d;
			break;

		case 2: // 'yxz'
			y0off = y0;
			y1off = y1;
			x0off = x0*h;
			x1off = x1*h;
			z0off = z0*h*w;
			z1off = z1*h*w;
			break;

		case 1: // 'xzy'
			x0off = x0;
			x1off = x1;
			z0off = z0*w;
			z1off = z1*w;
			y0off = y0*w*d;
			y1off = y1*w*d;
			break;

		default: // case 0: // 'xyz'
			x0off = x0;
			x1off = x1;
			y0off = y0*w;
			y1off = y1*w;
			z0off = z0*w*h;
			z1off = z1*w*h;
			break;
	}

	// Sample data vectors around the (x,y,z) point.
	var v000 = vectors[x0off + y0off + z0off];
	var v001 = vectors[x0off + y0off + z1off];
	var v010 = vectors[x0off + y1off + z0off];
	var v011 = vectors[x0off + y1off + z1off];
	var v100 = vectors[x1off + y0off + z0off];
	var v101 = vectors[x1off + y0off + z1off];
	var v110 = vectors[x1off + y1off + z0off];
	var v111 = vectors[x1off + y1off + z1off];

	var c00 = vec3.create();
	var c01 = vec3.create();
	var c10 = vec3.create();
	var c11 = vec3.create();

	vec3.lerp(c00, v000, v100, xf);
	vec3.lerp(c01, v001, v101, xf);
	vec3.lerp(c10, v010, v110, xf);
	vec3.lerp(c11, v011, v111, xf);

	var c0 = vec3.create();
	var c1 = vec3.create();

	vec3.lerp(c0, c00, c10, yf);
	vec3.lerp(c1, c01, c11, yf);

	var c = vec3.create();

	vec3.lerp(c, c0, c1, zf);

	return c;
};


var vabs = function(dst, v) {
	var x = v[0];
	var y = v[1];
	var z = v[2];
	dst[0] = x < 0 ? -x : x;
	dst[1] = y < 0 ? -y : y;
	dst[2] = z < 0 ? -z : z;
	return dst;
};

var findMinSeparation = function(xs) {
	var minSeparation = Infinity;
	xs.sort(function(a, b) { return a - b; });
	var len = xs.length;
	for (var i=1; i<len; i++) {
		var d = Math.abs(xs[i] - xs[i-1]);
		if (d < minSeparation) {
			minSeparation = d;
		}
	}
	return minSeparation;
};

// Finds the minimum per-component distance in positions.
//
var calculateMinPositionDistance = function(positions) {
	var xs = [], ys = [], zs = [];
	var xi = {}, yi = {}, zi = {};
	var len = positions.length;
	for (var i=0; i<len; i++) {
		var p = positions[i];
		var x = p[0], y = p[1], z = p[2];

		// Split the positions array into arrays of unique component values.
		//
		// Why go through the trouble of using a uniqueness hash table vs
		// sort and uniq:
		//
		// Suppose you've got a million positions in a 100x100x100 grid.
		//
		// Using a uniqueness hash table, you're doing 1M array reads,
		// 3M hash table lookups from 100-element hashes, 300 hash table inserts, then
		// sorting three 100-element arrays and iterating over them.
		// Roughly, 1M + 3M * ln(100) + 300 * ln(100/2) + 3 * 100 * ln(100) + 3 * 100 =
		//          1M + 13.8M + 0.0012M +  0.0014M + 0.0003M
		//          =~ 15M
		//
		// Sort and uniq solution would do 1M array reads, 3M array inserts,
		// sort three 1M-element arrays and iterate over them.
		// Roughly, 1M + 3M + 3 * 1M * ln(1M) + 3 * 1M =
		//          1M + 3M + 41.4M + 3M
		//          =~ 48.4M
		//
		// Guessing that a hard-coded sort & uniq would be faster due to not having
		// to run a hashing function on everything. More memory usage though
		// (bunch of small hash tables vs. duplicating the input array.)
		//
		// In JS-land, who knows. Maybe xi[x] casts x to string and destroys perf,
		// maybe numeric keys get special-cased, maybe the object lookups run at near O(1)-speeds.
		// Maybe the sorting comparison function is expensive to call, maybe it gets inlined or special-cased.
		//
		// ... You're probably not going to call this with more than 10k positions anyhow, so this is very academic.
		//
		if (!xi[x]) {
			xs.push(x);
			xi[x] = true;
		}
		if (!yi[y]) {
			ys.push(y);
			yi[y] = true;
		}
		if (!zi[z]) {
			zs.push(z);
			zi[z] = true;
		}
	}
	var xSep = findMinSeparation(xs);
	var ySep = findMinSeparation(ys);
	var zSep = findMinSeparation(zs);
	var minSeparation = Math.min(xSep, ySep, zSep);

	return isFinite(minSeparation) ? minSeparation : 1;
};

module.exports = function(vectorField, bounds) {
	var positions = vectorField.startingPositions;
	var maxLength = vectorField.maxLength || 1000;
	var tubeSize = vectorField.tubeSize || 1;
	var absoluteTubeSize = vectorField.absoluteTubeSize;
	var gridFill = vectorField.gridFill || '+x+y+z';

	var gridInfo = {};
	if(gridFill.indexOf('-x') !== -1) { gridInfo.reversedX = true; }
	if(gridFill.indexOf('-y') !== -1) { gridInfo.reversedY = true; }
	if(gridFill.indexOf('-z') !== -1) { gridInfo.reversedZ = true; }
	gridInfo.filled = GRID_TYPES.indexOf(gridFill.replace(/-/g, '').replace(/\+/g, ''));

	var getVelocity = vectorField.getVelocity || function(p) {
		return sampleMeshgrid(p, vectorField, gridInfo);
	};

	var getDivergence = vectorField.getDivergence || function(p, v0) {
		var dp = vec3.create();
		var e = 0.0001;

		vec3.add(dp, p, [e, 0, 0]);
		var vx = getVelocity(dp);
		vec3.subtract(vx, vx, v0);
		vec3.scale(vx, vx, 1/e);

		vec3.add(dp, p, [0, e, 0]);
		var vy = getVelocity(dp);
		vec3.subtract(vy, vy, v0);
		vec3.scale(vy, vy, 1/e);

		vec3.add(dp, p, [0, 0, e]);
		var vz = getVelocity(dp);
		vec3.subtract(vz, vz, v0);
		vec3.scale(vz, vz, 1/e);

		vec3.add(dp, vx, vy);
		vec3.add(dp, dp, vz);
		return dp;
	};

	var streams = [];

	var minX = bounds[0][0], minY = bounds[0][1], minZ = bounds[0][2];
	var maxX = bounds[1][0], maxY = bounds[1][1], maxZ = bounds[1][2];

	var inBounds = function(p) {
		var x = p[0];
		var y = p[1];
		var z = p[2];
		return !(
			x < minX || x > maxX ||
			y < minY || y > maxY ||
			z < minZ || z > maxZ
		);
	};

	var boundsSize = vec3.distance(bounds[0], bounds[1]);
	var maxStepSize = 10 * boundsSize / maxLength;
	var maxStepSizeSq = maxStepSize * maxStepSize;

	var minDistance = 1;
	var maxDivergence = 0; // For component-wise divergence vec3.create();

	// In case we need to do component-wise divergence visualization
	// var tmp = vec3.create();

	var len = positions.length;
	if (len > 1) {
		minDistance = calculateMinPositionDistance(positions);
	}

	for (var i = 0; i < len; i++) {
		var p = vec3.create();
		vec3.copy(p, positions[i]);

		var stream = [p];
		var velocities = [];
		var v = getVelocity(p);
		var op = p;
		velocities.push(v);

		var divergences = [];

		var dv = getDivergence(p, v);
		var dvLength = vec3.length(dv);
		if (isFinite(dvLength) && dvLength > maxDivergence) {
			maxDivergence = dvLength;
		}
		// In case we need to do component-wise divergence visualization
		// vec3.max(maxDivergence, maxDivergence, vabs(tmp, dv));
		divergences.push(dvLength);

		streams.push({points: stream, velocities: velocities, divergences: divergences});

		var j = 0;

		while (j < maxLength * 100 && stream.length < maxLength && inBounds(p)) {
			j++;
			var np = vec3.clone(v);
			var sqLen = vec3.squaredLength(np);
			if (sqLen === 0) {
				break;
			} else if (sqLen > maxStepSizeSq) {
				vec3.scale(np, np, maxStepSize / Math.sqrt(sqLen));
			}
			vec3.add(np, np, p);

			v = getVelocity(np);

			if (vec3.squaredDistance(op, np) - maxStepSizeSq > -0.0001 * maxStepSizeSq) {
				stream.push(np);
				op = np;
				velocities.push(v);
				var dv = getDivergence(np, v);
				var dvLength = vec3.length(dv);
				if (isFinite(dvLength) && dvLength > maxDivergence) {
					maxDivergence = dvLength;
				}
				// In case we need to do component-wise divergence visualization
				//vec3.max(maxDivergence, maxDivergence, vabs(tmp, dv));
				divergences.push(dvLength);
			}

			p = np;
		}
	}

	var tubes = createTubes(streams, vectorField.colormap, maxDivergence, minDistance);

	if (absoluteTubeSize) {
		tubes.tubeScale = absoluteTubeSize;
	} else {
		// Avoid division by zero.
		if (maxDivergence === 0) {
			maxDivergence = 1;
		}
		tubes.tubeScale = tubeSize * 0.5 * minDistance / maxDivergence;
	}

	return tubes;
};

var shaders = require('./lib/shaders');
var createMesh = require('gl-cone3d').createMesh;
module.exports.createTubeMesh = function(gl, params) {
	return createMesh(gl, params, {
		shaders: shaders,
		traceType: 'streamtube'
	});
}
