import store from '../store'

export default function (value) {
  const translations = store.getters.translations
  return resolve(value, translations)
}

function resolve (path, obj) {
  return path.toLowerCase().split('.').reduce(function (prev, curr) {
    return prev ? prev[curr] : null
  }, obj || self)
}
