
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]

# Entoj static export Library


## Running tests

Runs all test specs at once
```
npm test
```

Runs all test matching the given regex
```
npm test -- --grep model/
```

Enables logging while running tests
```
npm test -- --vvvv
```

Runs all test specs and shows test coverage
```
npm run coverage
```

Lints all source files
```
npm run lint
```

---

### Licence
[Apache License 2.0](LICENCE)

[travis-image]: https://img.shields.io/travis/entoj/entoj-export-static/master.svg?label=linux
[travis-url]: https://travis-ci.org/entoj/entoj-export-static
[appveyor-image]: https://img.shields.io/appveyor/ci/ChristianAuth/entoj-export-static/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/ChristianAuth/entoj-export-static
[coveralls-image]: https://img.shields.io/coveralls/entoj/entoj-export-static/master.svg
[coveralls-url]: https://coveralls.io/r/entoj/entoj-export-static?branch=master
