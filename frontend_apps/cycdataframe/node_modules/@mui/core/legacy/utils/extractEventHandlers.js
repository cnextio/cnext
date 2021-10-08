/**
 * Extracts event handlers from a given object.
 * A prop is considered an event handler if it is a function and its name starts with `on`.
 *
 * @param object An object to extract event handlers from.
 */
export default function extractEventHandlers(object) {
  if (object === undefined) {
    return {};
  }

  var result = {};
  Object.keys(object).filter(function (prop) {
    return prop.match(/^on[A-Z]/) && typeof object[prop] === 'function';
  }).forEach(function (prop) {
    result[prop] = object[prop];
  });
  return result;
}