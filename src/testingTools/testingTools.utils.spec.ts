import { expectType } from './testingTools.utils';

describe(`${expectType.name}`, () => {
    it('helps to assert if types are equal', () => {
        expectType<number>().toEqual<number>(true);

        // @ts-expect-error -- NOTE(harunou): test that the assertion resolves to an error if the types are equal but the expected types are not equal
        expectType<number>().toEqual<number>(false);

        // @ts-expect-error -- NOTE(harunou): test that assertion resolves to an error if the types are not equal
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(harunou): check if any is not equal string
        expectType<any>().toEqual<string>(true);

        expect(true).toBeTruthy();
    });
});
