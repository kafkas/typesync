import lodash from 'lodash';

export function camelCase(str: string): string {
  return lodash.camelCase(str);
}

export function pascalCase(str: string): string {
  return lodash.startCase(lodash.camelCase(str)).replace(/ /g, '');
}
