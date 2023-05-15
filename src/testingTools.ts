export type Brand<K, T> = K & { __brand: T };
export const sleep = (ms = 0): Promise<void> =>
    new Promise(resolve =>
        setTimeout(() => {
            resolve(undefined);
        }, ms)
    );
