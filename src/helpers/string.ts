export function replaceCaseInsensitive(
  where: string,
  what: string,
  by: string,
): string {
  const strLower = where.toLowerCase();
  const findLower = what.toLowerCase();
  let strTemp = where.toString();

  let pos = strLower.length;
  while ((pos = strLower.lastIndexOf(findLower, pos)) !== -1) {
    strTemp =
      strTemp.substr(0, pos) + by + strTemp.substr(pos + findLower.length);
    pos--;
  }
  return strTemp;
}
