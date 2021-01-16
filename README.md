# Game of Life 

Implementing Game of Life using Rust and Web Assembly from following [tutorial](https://rustwasm.github.io/docs/book/introduction.html).

## Development

Build Rust code
```
wasm-pack build
```
Start webpack dev server
```
cd www
yarn install
yarn start
```
Go to http://localhost:8080/

Testing
```
wasm-pack test --headless --chrome
```
