# ToFlowGeneratorFunction

[![codecov](https://codecov.io/github/harunou/to-flow-generator-function/branch/main/graph/badge.svg?token=1WTYGPJ8N5)](https://codecov.io/github/harunou/to-flow-generator-function)
[![npm](https://img.shields.io/npm/v/to-flow-generator-function)](https://www.npmjs.com/package/to-flow-generator-function)

The `toFlowGeneratorFunction` is a utility function that converts a promise-returning function into a generator-returning function. It is designed to enable the usage of type-safe `yield` statements inside MobX `flow` wrapper.

## Parameters

- `fn`: The promise-returning function to be converted into a generator-returning function.

## Examples

```typescript
import { flow } from 'mobx';
import { toFlowGeneratorFunction, type FlowGenerator } from 'to-flow-generator-function';

interface UserData {
    id: number;
    name: string;
    age: number;
}

const fetchUserName = (id: number): Promise<string> => Promise.resolve('John');
const fetchUserAge = (id: number): Promise<number> => Promise.resolve(25);

function* fetchUserData(id: number): FlowGenerator<UserData> {
    const name = yield* toFlowGeneratorFunction(fetchUserName)(id);
    // Here, `name` has the type `string`.
    const age = yield* toFlowGeneratorFunction(fetchUserAge)(id);
    // Here, `age` has the type `number`.
    return {
        id,
        name,
        age,
    };
}

const userId = 3;
const userData = await flow(fetchUserData)(userId);
// Here, `userData` has the type `UserData`.
```

More examples in [toFlowGeneratorFunction.spec.ts](./src/toFlowGeneratorFunction.spec.ts)

## Alternative solutions

<https://mobx-state-tree.js.org/API/#togeneratorfunction>
