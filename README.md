# to-ts

This converts simple JS to TS.

## Usage

Run from CLI with

    cat data.json | xargs -0 ./bin/main

```
type T0 = {
  foo: string;
  baz: T1;
};

type T1 = [number, number, number, T2];

type T2 = {
  1: T3;
  quux: null;
  true: boolean;
};

type T3 = {
  false: T4;
};

type T4 = [];
```

## Scripts

* tests - `yarn test`
* watch - `yarn watch`
* dev mode - `yarn dev --inspect`
