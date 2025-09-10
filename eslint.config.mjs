// @ts-check
// import vueParser from 'vue-eslint-parser';
import withNuxt from './.nuxt/eslint.config.mjs';
export default withNuxt([
  {
    // files: ['**/*.{ts,mts,tsx,vue}'],
    // languageOptions: {
    //   parser: vueParser,
    //   ecmaVersion: 'latest',
    //   sourceType: 'module',
    //   parserOptions: {
    //     templateTokenizer: {
    //       // template tokenizer for `<template lang="pug">`
    //       'pug': 'vue-eslint-parser-template-tokenizer-pug',
    //     }
    //   },
    // },
    rules: {
      'dot-notation': 'off', // 不強制使用 "."
      'no-console': 'off', // 可以使用 console
      quotes: ['error', 'single'], // 使用引號 double single
      'semi-style': ['error', 'last'], // 强制分号出现在句子末尾。
      'no-extra-semi': 'error', // 禁用不必要的分号。
      semi: ['error', 'always'], // 強制使用分號
      'no-empty-function': 'error', // 禁止空 function
      'no-unused-labels': 'error', // 禁止未使用的標籤
      'no-alert': 'off', // alert、confirm 和 prompt 禁止使用
      'arrow-parens': ['error', 'always'], // ()=>箭頭
      curly: 'off', // 可用 return 簡寫
    }
  }
]);

