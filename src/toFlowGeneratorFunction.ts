import { FlowGenerator } from './toFlowGeneratorFunction.types';

export function toFlowGeneratorFunctionWithCasting<TArgs extends unknown[], TReturn = void>(
    fn: (...args: TArgs) => Promise<TReturn> | TReturn
): (...args: TArgs) => FlowGenerator<TReturn> {
    return function* flowGeneratorFunction(...args: TArgs): FlowGenerator<TReturn> {
        let value: TReturn = undefined as TReturn;
        yield Promise.resolve(fn(...args)).then(result => {
            value = result;
        });

        return value;
    };
}