export const setDeepValue = <T>(
  obj: Record<string, any>,
  path: string,
  value: T,
): Record<string, any> => {
  const keys = path.split(".");

  return keys.reduceRight((acc, key, index) => {
    if (index === keys.length - 1) {
      return { ...obj, [key]: acc };
    }

    const parent = obj[key] ?? {};
    return {
      ...obj,
      [key]: {
        ...parent,
        ...acc,
      },
    };
  }, value as any);
};