export const _processDate = (date: number): string | number => {
  return date < 10 ? `0${date}` : date
}
