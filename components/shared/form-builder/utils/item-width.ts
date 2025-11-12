export const getItemWidth = (count: number) => {
  if (count === 1) return "w-full";
  if (count === 2) return "w-full sm:w-1/2";
  if (count === 3) return "w-full sm:w-1/2 md:w-1/3";
  if (count === 4) return "w-full sm:w-1/2 md:w-1/3 lg:w-1/4";
  return "w-full";
};
