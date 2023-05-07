import { FlowGenerator } from './promiseToFlowGeneratorFunction.types';

export function promiseToFlowGeneratorFunctionWithCasting<TArgs extends unknown[], TReturn = void>(
    p: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => FlowGenerator<TReturn> {
    return function* (...args: TArgs) {
        let value: TReturn = undefined as TReturn;
        yield p(...args).then(result => {
            value = result;
        });
        return value;
    };
}
