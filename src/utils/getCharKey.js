export function getCharKey(char, action = null, dir = null) {
  if (!char || !char.selectedSubclass) return null;

  const name = char.selectedSubclass.toLowerCase().replace(/\s+/g, "");

  if (action === "die") {
    return `${name}_${action}`;
  }

  return `${name}_${dir}_${action}`;
}