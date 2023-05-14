import type { Equal } from './testingTools.types';

export const sleep = (ms = 0): Promise<void> =>
    new Promise(resolve =>
        setTimeout(() => {
            resolve(undefined);
        }, ms)
    );

export const expectType = <T>(): {
    toEqual<R>(value: Equal<T, R>): void;
} => {
    return {
        toEqual: <R>(value: Equal<T, R>): void => {
            void value;
        },
    };
};
