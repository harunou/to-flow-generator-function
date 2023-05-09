import type { Equal, NotAny } from './testingTools.types';

export const sleep = (ms = 0): Promise<void> =>
    new Promise(resolve =>
        setTimeout(() => {
            resolve(undefined);
        }, ms)
    );

export const expectType = <T>(): {
    notToBeAny(value: NotAny<T>): void;
    toEqual<R>(value: Equal<T, R>): void;
} => {
    return {
        notToBeAny: (value: NotAny<T>): void => {
            void value;
        },
        toEqual: <R>(value: Equal<T, R>): void => {
            void value;
        },
    };
};
