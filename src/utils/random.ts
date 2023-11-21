export class RandomLCG {
  private seed: number;
  private a: number = 1664525;
  private c: number = 1013904223;
  private m: number = 2 ** 32;

  constructor(seed: number) {
    this.seed = seed;
  }

  public random(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  public pickRandomElements<T>(array: T[], count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(this.random() * array.length);
      result.push(array[index]);
    }
    return result;
  }
}
