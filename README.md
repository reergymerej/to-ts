# to-ts

This converts simple JS to TS.

## Usage

Given fixtures/names.json

```json
{
  "favoriteNumber": 666,
  "person": {
    "name": "Santa",
    "weight": 175
  }
}
```

run

```sh
$ cat fixtures/names.json | xargs -0 ./bin/main

type Root = {
  favoriteNumber: number;
  person: Person;
};

type Person = {
  name: string;
  weight: number;
};
```


## Scripts

* tests - `yarn test`
* watch - `yarn watch`
* dev mode - `yarn dev --inspect`
