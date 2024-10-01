import * as UlidModule from "id128";

const Ulid = UlidModule.default;
const { UlidMonotonic : UlidMonotonicFactory } = Ulid;

export function getHex(): string {
  const id = UlidMonotonicFactory.generate();
  return id.toRaw();
}

export function fromCanonicalToRaw(value: string) {
  return UlidMonotonicFactory.fromCanonical(value).toRaw()
}

export function fromRawToCanonical(value: string) {
  return UlidMonotonicFactory.fromRaw(value).toCanonical()
}
