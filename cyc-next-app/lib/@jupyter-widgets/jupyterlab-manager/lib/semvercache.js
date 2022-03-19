// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { maxSatisfying } from 'semver';
/**
 * A cache using semver ranges to retrieve values.
 */
export class SemVerCache {
    constructor() {
        this._cache = Object.create(null);
    }
    set(key, version, object) {
        if (!(key in this._cache)) {
            this._cache[key] = Object.create(null);
        }
        if (!(version in this._cache[key])) {
            this._cache[key][version] = object;
        }
        else {
            throw `Version ${version} of key ${key} already registered.`;
        }
    }
    get(key, semver) {
        if (key in this._cache) {
            let versions = this._cache[key];
            let best = maxSatisfying(Object.keys(versions), semver);
            return versions[best];
        }
    }
}
