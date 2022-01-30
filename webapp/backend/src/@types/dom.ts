// https://stackoverflow.com/questions/66275648/aws-javascript-sdk-v3-typescript-doesnt-compile-due-to-error-ts2304-cannot-f

export {}

declare global {
  type ReadableStream = unknown
  type Blob = unknown
  type File = unknown
}
