import { flow as _flow, FlowCancellationError } from 'mobx';
import { toFlowGeneratorFunctionWithCasting as toFlowGeneratorFunction } from './toFlowGeneratorFunction';
import { expectType, sleep, TestHttpClient } from './testingTools';
import type { Annotation, CancellablePromise } from 'mobx/dist/internal';
import type { FlowGenerator } from './toFlowGeneratorFunction.types';

type Brand<K, T> = K & { __brand: T };

// NOTE(harunou): flow type without any
interface Flow extends Annotation, PropertyDecorator {
    <R, Args extends unknown[]>(
        generator: (
            ...args: Args
        ) => Generator<unknown, R, unknown> | AsyncGenerator<unknown, R, unknown>
    ): (...args: Args) => CancellablePromise<R>;
    bound: Annotation & PropertyDecorator;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- NOTE(harunou): allow assign less strict _flow to stricter flow
const flow: Flow = _flow;

describe(`${toFlowGeneratorFunction.name}`, () => {
    let httpClient: TestHttpClient;
    let expected: number;
    let endpoint: string;
    let request: Request;
    beforeEach(() => {
        httpClient = new TestHttpClient();
        expected = 5;
        endpoint = 'test-request';
        request = new Request('test-request');
    });
    afterEach(() => {
        httpClient.verify();
    });
    it('allows to get promise value as generator return', async () => {
        const generator = toFlowGeneratorFunction(() => httpClient.request<number>(request));
        const iterable = generator();
        const yeldResult = iterable.next();
        httpClient.expectOne<typeof expected>(endpoint).resolve(expected);
        await yeldResult.value;
        const returnResult = iterable.next();

        expect(returnResult.done).toBeTruthy();
        expect(returnResult.value).toEqual(5);
    });

    it('allows to get value with flow', async () => {
        const flowGenerator = toFlowGeneratorFunction(() => expected);
        const flowFunction = flow(flowGenerator);
        const promise = flowFunction();

        expectType<Awaited<typeof promise>>().toEqual<number>(true);
        await expect(promise).resolves.toEqual(expected);
    });

    it('allows to get promise value with flow', async () => {
        const flowGenerator = toFlowGeneratorFunction(() => httpClient.request<number>(request));
        const flowFunction = flow(flowGenerator);
        const promise = flowFunction();
        httpClient.expectOne<typeof expected>(endpoint).resolve(expected);

        expectType<Awaited<typeof promise>>().toEqual<number>(true);
        await expect(promise).resolves.toEqual(expected);
    });

    it('accepts a parameter', async () => {
        const paramValue = '5';
        const flowGenerator = toFlowGeneratorFunction((param: string) => {
            return httpClient.request<string>(
                new Request(endpoint, { method: 'POST', body: param })
            );
        });
        const flowFunction = flow(flowGenerator);
        const promise = flowFunction(paramValue);
        httpClient.expectOne<typeof expected>(endpoint).resolve(expected);

        expectType<Awaited<typeof promise>>().toEqual<string>(true);
        await expect(promise).resolves.toEqual(expected);
    });

    it('does not throw while is waiting for a response', async () => {
        const flowGenerator = toFlowGeneratorFunction(() => httpClient.request<number>(request));
        const flowFunction = flow(flowGenerator);
        const promise = flowFunction();
        await sleep();
        await sleep();

        expectType<Awaited<typeof promise>>().toEqual<number>(true);
        httpClient.expectOne<typeof expected>(endpoint).resolve(expected);
        await expect(promise).resolves.toEqual(expected);
    });

    it('throws an error if request rejected', async () => {
        const error = new Error('Request: rejected');
        const flowGenerator = toFlowGeneratorFunction(() => httpClient.request<never>(request));
        const flowFunction = flow(flowGenerator);
        const promise = flowFunction();
        httpClient.expectOne(endpoint).reject(error);

        expectType<Awaited<typeof promise>>().toEqual<never>(true);
        await expect(promise).rejects.toEqual(error);
    });

    it('does not hide runtime errors in the factory function', async () => {
        const error = new Error('Generator: error');
        const flowGenerator = toFlowGeneratorFunction(() => {
            throw error;
        });
        const flowFunction = flow(flowGenerator);

        expectType<Awaited<ReturnType<typeof flowFunction>>>().toEqual<never>(true);
        await expect(() => flowFunction()).rejects.toEqual(error);
    });

    it('does not hide runtime errors in promise function', async () => {
        const error = new Error('Generator: error');
        const flowGenerator = toFlowGeneratorFunction(() =>
            Promise.resolve(true).then(() => {
                throw error;
            })
        );
        const flowFunction = flow(flowGenerator);

        expectType<Awaited<ReturnType<typeof flowFunction>>>().toEqual<never>(true);
        await expect(() => flowFunction()).rejects.toEqual(error);
    });

    it('allows to compose multiple requests', async () => {
        type Number0 = Brand<number, 'TYPE_0'>;
        type Number1 = Brand<number, 'TYPE_1'>;
        type Number2 = Brand<number, 'TYPE_2'>;

        type FlowResult0 = { returnResult0: Number0; returnResult1: Number1 };
        type FlowResult1 = {
            returnResult0: Number0;
            returnResult1: Number1;
            returnResult2: Number2;
        };

        const endpoint0 = `${endpoint}/0`;
        const endpoint1 = `${endpoint}/1`;
        const endpoint2 = `${endpoint}/2`;

        const number0 = 7 as Number0;
        const number1 = 9 as Number1;
        const number2 = 5 as Number2;

        const expected0: FlowResult1 = {
            returnResult0: number0,
            returnResult1: number1,
            returnResult2: number2,
        };

        const flowGenerator0 = toFlowGeneratorFunction((param: string) =>
            httpClient.request<Number0>(new Request(endpoint0, { method: 'POST', body: param }))
        );
        const flowGenerator1 = toFlowGeneratorFunction(() =>
            httpClient.request<Number1>(new Request(endpoint1))
        );
        const flowGenerator2 = toFlowGeneratorFunction((param: number) =>
            httpClient.request<Number2>(
                new Request(endpoint2, { method: 'POST', body: `${param}` })
            )
        );
        function* flowGenerator3(param: string): FlowGenerator<FlowResult0> {
            void param;
            const returnResult0 = yield* flowGenerator0(param);
            const returnResult1 = yield* flowGenerator1();
            return {
                returnResult0,
                returnResult1,
            };
        }
        function* flowGenerator4(param: number): FlowGenerator<FlowResult1> {
            const { returnResult0, returnResult1 } = yield* flowGenerator3(`${param}`);
            const returnResult2 = yield* flowGenerator2(param);

            return {
                returnResult0,
                returnResult1,
                returnResult2,
            };
        }
        const flowFunction = flow(flowGenerator4);
        const promise = flowFunction(8);
        httpClient.expectOne<Number0>(endpoint0).resolve(number0);
        httpClient.verify();
        await sleep();
        httpClient.expectOne<Number1>(endpoint1).resolve(number1);
        httpClient.verify();
        await sleep();
        httpClient.expectOne<Number2>(endpoint2).resolve(number2);
        httpClient.verify();
        await expect(promise).resolves.toEqual<FlowResult1>(expected0);
    });

    it('allows to cancel in the middle', async () => {
        type Number0 = Brand<number, 'TYPE_0'>;
        type Number1 = Brand<number, 'TYPE_1'>;
        type Number2 = Brand<number, 'TYPE_2'>;

        type FlowResult0 = { returnResult0: Number0; returnResult1: Number1 };
        type FlowResult1 = {
            returnResult0: Number0;
            returnResult1: Number1;
            returnResult2: Number2;
        };

        const endpoint0 = `${endpoint}/0`;
        const endpoint1 = `${endpoint}/1`;
        const endpoint2 = `${endpoint}/2`;

        const number0 = 7 as Number0;
        const number1 = 9 as Number1;

        const flowGenerator0 = toFlowGeneratorFunction((param: string) =>
            httpClient.request<Number0>(new Request(endpoint0, { method: 'POST', body: param }))
        );
        const flowGenerator1 = toFlowGeneratorFunction(() =>
            httpClient.request<Number1>(new Request(endpoint1))
        );
        const flowGenerator2 = toFlowGeneratorFunction((param: number) =>
            httpClient.request<Number2>(
                new Request(endpoint2, { method: 'POST', body: `${param}` })
            )
        );
        function* flowGenerator3(param: string): FlowGenerator<FlowResult0> {
            void param;
            const returnResult0 = yield* flowGenerator0(param);
            const returnResult1 = yield* flowGenerator1();
            return {
                returnResult0,
                returnResult1,
            };
        }
        function* flowGenerator4(param: number): FlowGenerator<FlowResult1> {
            const { returnResult0, returnResult1 } = yield* flowGenerator3(`${param}`);
            const returnResult2 = yield* flowGenerator2(param);

            return {
                returnResult0,
                returnResult1,
                returnResult2,
            };
        }
        const flowFunction = flow(flowGenerator4);
        const promise = flowFunction(8);
        httpClient.expectOne<Number0>(endpoint0).resolve(number0);
        httpClient.verify();
        await sleep();
        httpClient.expectOne<Number1>(endpoint1).resolve(number1);
        httpClient.verify();
        await sleep();
        promise.cancel();

        // Remove pending (third) request
        httpClient.removeOne(endpoint2);
        httpClient.verify();

        await expect(promise).rejects.toBeInstanceOf(FlowCancellationError);
    });
});
