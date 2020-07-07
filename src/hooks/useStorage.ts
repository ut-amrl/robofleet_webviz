import { useState } from 'react';

// this allows static checking of whether a value can be stringified, but is unnecessary
export type JsonValue = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type Json = JsonValue | JsonArray | { [k: string]: Json };
// avoids T becoming a literal type (e.g. true with type "true")
export type WidenType<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;
export type SetterArgument<S> = S | ((old: S) => S);
export type Setter<S> = (s: SetterArgument<S>) => void;

/**
 * Behaves like useState(), but persists the value to a Storage object.
 * The initial state will be read from storage, if it exists.
 *
 * The state type must be serializable to JSON.
 *
 * @param key unique identifier for this value
 * @param initialState the initial value for the state
 * @param storage a backing store object implementing the Storage interface
 */
export default function useStorage<T extends Json, S = WidenType<T>>(
    key: string,
    initialState: S | (() => S),
    storage: Storage = window.localStorage,
): [S, Setter<S>] {
    const getInitial = () => (initialState instanceof Function ? initialState() : initialState);

    const getValue = () => {
        const v = storage.getItem(key);
        return v ? (JSON.parse(v) as S) : getInitial();
    };

    const [value, setValue] = useState(getValue());

    // state setter wrapper that stores new value to storage
    const setValueWrapper = (x: SetterArgument<S>) => {
        const newValue = x instanceof Function ? x(value) : x;
        storage.setItem(key, JSON.stringify(newValue));
        setValue(newValue);
    };

    return [value, setValueWrapper];
}
