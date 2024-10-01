import JSONBig from 'json-bigint'

const JSONBigNative = JSONBig({ useNativeBigInt: true });

export const {
  parse: JSONParse,
  stringify: JSONStringify,
} = JSONBigNative;