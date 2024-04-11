import lodash from 'lodash';

export function pascalCase(str: string): string {
  return lodash.startCase(lodash.camelCase(str)).replace(/ /g, '');
}
