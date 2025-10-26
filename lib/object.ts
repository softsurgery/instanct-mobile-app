export const setDeepValue = <T>(obj: any, path: string, value: T): any => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const nested = keys.reduce((acc, key) => {
    if (typeof acc[key] !== "object" || acc[key] === null) {
      acc[key] = {};
    }
    return acc[key];
  }, obj);
  if (lastKey) nested[lastKey] = value;
  return obj;
};
