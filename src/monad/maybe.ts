import { ResultE, Ok, Err } from './result'

export function isMaybe<T>(value: Maybe<T> | T | null | undefined): value is Maybe<T> {
	if (!value) { return false }
	return value instanceof Just || value instanceof Nothing
}

export interface Maybe<T> {
	/**
	 * Returns true if the option is a Some value
	 */
	isSome(): boolean

	/**
	 * Returns true if the option is a None value
	 */
	isNone(): boolean

	/**
	 * Returns check result if the option is a Some value
	 */
	isSomeAnd(fn: (a: T) => boolean): boolean

	/**
	 * Returns check result if the option is a None value
	 */
	isNoneAnd(fn: () => boolean): boolean

	/**
	 * Returns the inner T of a Some(T). Throws an exception if the self value equals None.
	 */
	unwrap(): T

	/**
	 * Returns the contained value or a default.
	 * @param def
	 */
	unwrapOr(): T | undefined
	unwrapOr(def: T): T

	/**
	 * Returns the contained value or computes it from a closure.
	 * @param f
	 */
	unwrapOrElse(f: () => T): T

	/**
	 * Maps an Option<T> to Option<U> by applying a function to a contained value
	 * @param f
	 */
	map<U>(f: (a: T) => U): Maybe<U>

	/**
	 * Applies a function to the contained value or returns a default.
	 * @param def
	 * @param f
	 */
	mapOr<U>(def: U, f: (a: T) => U): U

	/**
	 * Applies a function to the contained value or computes a default.
	 * @param def
	 * @param f
	 */
	mapOrElse<U>(def: () => U, f: (a: T) => U): U

	/**
	 * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err).
	 * @param err
	 */
	okOr<E>(err: E): ResultE<T, E>

	/**
	 * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err()).
	 * @param err
	 */
	okOrElse<E>(err: () => E): ResultE<T, E>

	/**
	 * Returns None if the option is None, otherwise returns optb.
	 * @param optb
	 */
	and<U>(optb: Maybe<U>): Maybe<U>

	/**
	 * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
	 * Some languages call this operation flatmap.
	 * @param f
	 */
	andThen<U>(f: (a: T) => Maybe<U>): Maybe<U>

	/**
	 * Returns the option if it contains a value, otherwise returns optb.
	 * @param optb
	 */
	or(optb: Maybe<T>): Maybe<T>

	/**
	 * Returns the option if it contains a value, otherwise calls f and returns the result.
	 * @param f
	 */
	orElse(f: () => Maybe<T>): Maybe<T>
}

export namespace Maybe {
	export function just<T>(value: T): Maybe<T> {
		if (value) {
			return new Just(value)
		} else {
			throw new Error('Cannot create Just with null or undefined value')
		}
	}

	export function nothing<T>(): Maybe<T> {
		return new Nothing<T>()
	}

	export function maybe<T>(value: T | null | undefined): Maybe<T> {
		if (value != null) {
			return new Just(value)
		} else {
			return new Nothing<T>()
		}
	}
}

export default Maybe

export class Just<T> implements Maybe<T> {
	private value: T

	constructor(v: T) {
		this.value = v
	}

	static wrapNull<T>(value: T): Maybe<T> {
		if (value == null) {
			return new Nothing<T>()
		} else {
			return new Just<T>(value)
		}
	}

	map <U>(fn: (a: T) => U): Maybe<U> {
		return new Just(fn(this.value))
	}

	isSome(): boolean {
		return true
	}

	isNone(): boolean {
		return false
	}

	isSomeAnd(fn: (a: T) => boolean): boolean {
		return fn(this.value)
	}

	isNoneAnd(_: () => boolean): boolean {
		return false
	}

	unwrap(): T {
		return this.value
	}

	unwrapOr(): T
	unwrapOr(_: T): T
	unwrapOr(_?: T): T {
		return this.value
	}

	unwrapOrElse(_: () => T): T {
		return this.value
	}

	mapOr<U>(_: U, f: (a: T) => U): U {
		return f(this.value)
	}

	mapOrElse<U>(_: () => U, f: (a: T) => U): U {
		return f(this.value)
	}

	okOr<E>(_: E): ResultE<T, E> {
		return new Ok<T, E>(this.value)
	}

	okOrElse<E>(_: () => E): ResultE<T, E> {
		return new Ok<T, E>(this.value)
	}

	and<U>(optb: Maybe<U>): Maybe<U> {
		return optb
	}

	andThen<U>(f: (a: T) => Maybe<U>): Maybe<U> {
		return f(this.value)
	}

	or(_: Maybe<T>): Maybe<T> {
		return this
	}

	orElse(_: () => Maybe<T>): Maybe<T> {
		return this
	}

	toString(): string {
		return 'Some ' + this.value
	}
}

export class Nothing<T> implements Maybe<T> {

	constructor() {

	}

	map <U>(_: (a: T) => U): Maybe<U> {
		return <Maybe<U>>Nothing._instance
	}

	isSome(): boolean {
		return false
	}

	isNone(): boolean {
		return true
	}

	isSomeAnd(_: (a: T) => boolean): boolean {
		return false
	}

	isNoneAnd(fn: () => boolean): boolean {
		return fn()
	}

	unwrap(): T {
		console.error('None.unwrap())')
		throw 'None.unwrap'
	}

	unwrapOr(): T | undefined
	unwrapOr(def: T): T
	unwrapOr(def?: T): T | undefined {
		return def
	}

	unwrapOrElse(f: () => T): T {
		return f()
	}

	mapOr<U>(def: U, _: (a: T) => U): U {
		return def
	}

	mapOrElse<U>(def: () => U, _: (a: T) => U): U {
		return def()
	}

	okOr<E>(err: E): ResultE<T, E> {
		return new Err<T, E>(err)
	}

	okOrElse<E>(err: () => E): ResultE<T, E> {
		return new Err<T, E>(err())
	}

	and<U>(_: Maybe<U>): Maybe<U> {
		return Nothing.instance<U>()
	}

	andThen<U>(_: (a: T) => Maybe<U>): Maybe<U> {
		return Nothing.instance<U>()
	}

	or(optb: Maybe<T>): Maybe<T> {
		return optb
	}

	orElse(f: () => Maybe<T>): Maybe<T> {
		return f()
	}

	private static _instance: Maybe<any> = new Nothing()

	public static instance<X>(): Maybe<X> {
		return <Maybe<X>> Nothing._instance
	}

	public toString(): string {
		return 'None'
	}
}
