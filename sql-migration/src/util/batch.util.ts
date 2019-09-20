export class BatchUtil {
  build<T>(source: T[], batchSize: number = 50): T[][] {
    const res: T[][] = [[]];
    if (!source) {
      return res;
    }

    let count = 0;
    source.forEach(item => {
      if (res[count].length >= batchSize) {
        count++;
        res[count] = [item];
      } else {
        res[count].push(item);
      }
    });

    return res;
  }

  async execute<T>(batch: T[][], perItemAction: ((T) => Promise<any>), postBatchAction?: ((any) => Promise<any>)) {
    for (const personBatch of batch) {
      await Promise.all(personBatch.map(person => perItemAction(person)));
      if (postBatchAction) {
        await postBatchAction(personBatch);
      }
    }
  }

  async buildAndExecute<T>(
    source: T[],
    perItemAction: ((T) => Promise<any>),
    postBatchAction?: ((any) => Promise<any>),
    batchSize: number = 50
  ) {
    const batches = this.build(source, batchSize);
    return this.execute(batches, perItemAction, postBatchAction);
  }
}
