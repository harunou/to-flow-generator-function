# ToFlowGeneratorFunction

[![codecov](https://codecov.io/github/harunou/to-flow-generator-function/branch/main/graph/badge.svg?token=1WTYGPJ8N5)](https://codecov.io/github/harunou/to-flow-generator-function)

Converts a promise-returning function to a generator-returning one. This is intended to allow for the usage of type-safe yield inside a MobX flow wrapper.

## Parameters

- `fn`

## Examples

```typescript

interface UserData {
    id: number;
    name: string;
    age: number;
}

const fetchUserName = (id: number) => Promise.resolve('John');
const fetchUserAge = (id: number) => Promise.resolve(25);

function* fetchUserData(id: number): FlowGenerator<UserData> {
    const name = yield* toFlowGeneratorFunction(fetchUserName)(id);
    // name is type of string
    const age = yield* toFlowGeneratorFunction(fetchUserAge)(id);
    // age is type of number
    return {
        id,
        name,
        age,
    };
}

const userId = 3;
const userData = await flow(fetchUserData)(userId);

```

More examples in [toFlowGeneratorFunction.spec.ts](./src/toFlowGeneratorFunction.spec.ts)

## Alternative solutions

<https://mobx-state-tree.js.org/API/#togeneratorfunction>
