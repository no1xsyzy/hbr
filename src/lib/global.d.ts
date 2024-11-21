declare module '*.toml' {
  const value: unknown
  export default value
}

declare module '*?uint8array' {
  const u8arr: Uint8Array
  export default u8arr
}
