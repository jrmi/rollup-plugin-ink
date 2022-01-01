# rollup-plugin-ink

A rollup plugin to convert `.ink` file to ES module. 

[Ink](https://github.com/inkle/ink)  is an open source scripting language for 
writing interactive narrative. 

This plugin transform the source Ink file using `inklecate` then you can import
it like any other file:

```js
import story from "./story.ink"

```

## Getting Started

First install `rollup-plugin-ink` as development dependency:

```sh
npm i rollup-plugin-ink --save-dev
# or
yarn add rollup-plugin-ink --dev
```