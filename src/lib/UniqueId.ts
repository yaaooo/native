function s4 (): string {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

export const UniqueId = {
  get(prefix = "", delimiter = "-"): string {
    const suffix = s4() + s4();

    return prefix ? prefix + delimiter + suffix : suffix;
  },
  parse(str: string): string {
    return `${str}`.toLowerCase().replace(/\s+/g, "-");
  }
};
