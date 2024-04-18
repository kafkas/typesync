import lodash from 'lodash';

export function getUniqueElements<T>(elements: T[]) {
  return lodash.xor(...elements.map(elem => [elem]));
}

export function getDuplicateElements<T>(elements: T[]) {
  return lodash.xor(elements, getUniqueElements(elements));
}
