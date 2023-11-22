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

  public pickRandomElements<T extends { _id: any }>(
    array: T[],
    count: number
  ): T[] {
    const result: T[] = [];
    const pickedIds = new Set();

    while (result.length < count) {
      const index = Math.floor(this.random() * array.length);
      const element = array[index];

      if (!pickedIds.has(element._id)) {
        pickedIds.add(element._id);
        result.push(element);
      }
    }

    return result;
  }
}
