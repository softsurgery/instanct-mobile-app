import { ZodError } from "zod";

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

export function nestErrors(errors: Record<string, string[]>) {
  const result: any = {};

  for (const key in errors) {
    const keys = key.split(".");
    let current = result;

    keys.forEach((k, index) => {
      if (index === keys.length - 1) {
        current[k] = errors[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    });
  }

  return result;
}

export function zodErrorsToNested(error: ZodError) {
  const result: any = {};

  for (const issue of error.issues) {
    let current = result;

    for (let i = 0; i < issue.path.length; i++) {
      const key = issue.path[i];
      const isLast = i === issue.path.length - 1;

      if (isLast) {
        if (typeof key === "number") {
          current[key] = current[key] || [];
          current[key].push(issue.message);
        } else {
          current[key] = current[key] || [];
          current[key].push(issue.message);
        }
      } else {
        if (typeof key === "number") {
          if (!Array.isArray(current[key])) {
            current[key] = [];
          }
        } else {
          if (typeof current[key] !== "object" || current[key] === null) {
            current[key] = {};
          }
        }

        current = current[key];
      }
    }
  }

  return result;
}
