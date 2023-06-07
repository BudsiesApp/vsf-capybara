export function getFieldAnchorName (field: string): string {
  // Strip quotes
  let fieldName = field.replace(/^['"]+|['"]+$/g, '');
  // Strip spaces & convert to lower case
  fieldName = fieldName.toLowerCase().replace(/ /g, '-');

  return `${fieldName}-field-anchor`;
}
