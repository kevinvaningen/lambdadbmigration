
export class JestMock<T> {
  fn: T | {[p: string]: jest.Mock<any>} | any = {};
  typed = (this.fn as any) as T;
  constructor(...methodNames: string[]) {
    methodNames.forEach(name => (this.fn[name] = jest.fn()));
  }
}

export const testResolve = value => new Promise(resolve => resolve(value));
export const testReject = value => new Promise((_, reject) => reject(value));
