import Maybe from './maybe'
import { eq } from './index'
import { Res } from './res'

export interface ResultPatterns<T, E, R> {
	Ok: (l: T) => R
	Err: (r: E) => R
	Missing: (e: Missing) => R
}

export class Missing extends Error {
	message: string
	info?: any
	constructor(msg: string = '', info?: any) {
		super()
		this.message = `Missing: ${msg}`
		this.info = info
	}
}

Missing.prototype.name = 'Missing'

export interface ResultE<T, E> {
	__phantomT: T
	__phantomE: E

	/**
	 * Returns true if the result is Ok
	 */
	isOk(): this is Ok<T, E>

	/**
	 * Returns true if the result is Err
	 */
	isErr(): this is Err<T, E>

	/**
	 * Returns true if the result is Err(Missing)
	 */
	isMissing(): this is Err<T, Missing>

	/**
	 * Convert from Result<T, E> to Maybe<T>
	 * Converts self into an Maybe<T>, and discarding the error, if any.
	 */
	ok(): Maybe<T>

	/**
	 * Convert from Result<T, E> to Maybe<E>
	 * Converts self into an Maybe<E>, and discarding the value, if any.
	 */
	err(): Maybe<E>

	/**
	 * Maps a Result<T, E> to Result<U, E> by applying a function to an contained Ok value, leaving an Err value untouched.
	 * This function can be used to compose the results of two functions.
	 * @param fn
	 */
	map<U>(fn: (a: T) => U): ResultE<U, E>

	/**
	 * Maps a Result<T, E> to Result<T, F> by applying a function to an contained Err value, leaving an Ok value untouched.
	 * This function can be used to pass through a successful result while handling an error.
	 * @param fn
	 */
	mapErr<U>(fn: (a: E) => U): ResultE<T, U>

	/**
	 * Returns res if the result is Ok, otherwise returns the Err value of self.
	 * @param res
	 */
	and<U>(res: ResultE<U, E>): ResultE<U, E>

	/**
	 * Calls op if the result is Ok, otherwise returns the Err value of self.
	 * This function can be used for control flow based on result values.
	 */
	andThen<U>(op: (a: T) => ResultE<U, E>): ResultE<U, E>

	/**
	 * Returns res if the result is Err, otherwise returns the Ok value of self.
	 * @param res
	 */
	or(res: ResultE<T, E>): ResultE<T, E>

	/**
	 * Calls op if the result is Err, otherwise returns the Ok value of self.
	 * This function can be used for control flow based on result values.
	 * @param op
	 */
	orElse<U>(op: (a: E) => ResultE<T, U>): ResultE<T, U>

	/**
	 * Unwraps a result, yielding the content of an Ok.
	 */
	unwrap(): T

	/**
	 * Unwraps a result, yielding the content of an Ok. Else it returns optb.
	 */
	unwrapOr<R>(_: R): T | R

	/**
	 * Unwraps a result, yielding the content of an Err.
	 * @param op
	 */
	unwrapOrElse(op: (u: E) => T): T

	unsafeCast<A>(): ResultE<A, E>

	caseOf<R>(pattern: ResultPatterns<T, E, R>): R
	res(): Res<T>
}

export namespace ResultE {
	export function ok<T, E>(value: T): Ok<T, E> {
		return new Ok<T, E>(value)
	}

	export function err<T, E>(err: E): Err<T, E> {
		return new Err<T, E>(err)
	}

	export function all<T, E>(results: ResultE<T, E>[]): ResultE<T[], E> {
		const values: T[] = []
		for (const res of results) {
			if (res.isOk()) {
				values.push(res.unwrap())
			} else {
				return ResultE.err<T[], E>(res.err().unwrap())
			}
		}

		return ResultE.ok<T[], E>(values)
	}

	export function isResult<T, E>(value: ResultE<T, E> | T | null | undefined): value is ResultE<T, E> {
		if (!value) { return false }
		return value instanceof Ok || value instanceof Err
	}

	export function missing<T>(value?: T | null | undefined, msg?: (() => string), info?: any): Result<T> {
		if (value != null) {
			return Result.ok(value)
		} else {
			return Result.err<T>(new Missing(
				typeof msg === 'function'
					? msg()
					: msg,
				info))
		}
	}
}

export class Ok<T, E> {
	value: T

	__phantomT: T
	__phantomE: E

	constructor(v: T) {
		if (v != null) {
			this.value = v
		} else {
			throw new Error('`Ok` can\'t hold `null` or `undefined`.')
		}
	}

	map<U>(fn: (a: T) => U): ResultE<U, E> {
		return new Ok<U, E>(fn(this.value))
	}

	mapErr<U>(_: (a: E) => U): ResultE<T, U> {
		return new Ok<T, U>(this.value)
	}

	isOk(): this is Ok<T, E> {
		return true
	}

	isErr(): this is Err<T, E> {
		return false
	}

	isMissing(): this is Err<T, Missing> {
		return false
	}

	ok(): Maybe<T> {
		return Maybe.just(this.value)
	}

	err(): Maybe<E> {
		return Maybe.nothing<E>()
	}

	and<U>(res: ResultE<U, E>): ResultE<U, E> {
		return res
	}

	andThen<U>(op: (a: T) => ResultE<U, E>): ResultE<U, E> {
		return op(this.value)
	}

	or(_: ResultE<T, E>): ResultE<T, E> {
		return this
	}

	orElse<U>(_: (a: E) => ResultE<T, U>): ResultE<T, U> {
		return new Ok<T, U>(this.value)
	}

	unwrapOr<R>(_: R): T | R {
		return this.value
	}

	unwrapOrElse(_: (e: E) => T): T {
		return this.value
	}

	unwrap(): T {
		return this.value
	}

	toString(): string {
		return 'Ok ' + this.value
	}

	unsafeCast<A>(): Ok<A, E> {
		return this as any
	}

	caseOf<R>(pattern: ResultPatterns<T, E, R>) {
		return pattern.Ok(this.value)
	}

	equals(other: ResultE<T, E>) {
		if (other instanceof Ok) {
			return eq(this.value, other.value)
		} else {
			return false
		}
	}

	res(): Res<T> {
		return this.value
	}
}

export class Err<T, E> {
	error: E

	__phantomT: T
	__phantomE: E

	constructor(error: E) {
		if (error != null) {
			this.error = error
		} else {
			throw new Error('`Err` can\'t hold `null` or `undefined`.')
		}
	}

	map<U>(_: (a: T) => U): ResultE<T, E> {
		return this
	}

	mapErr <U>(fn: (a: E) => U): ResultE<T, U> {
		return new Err<T, U>(fn(this.error))
	}

	isOk(): this is Ok<T, E> {
		return false
	}

	isErr(): this is Err<T, E> {
		return true
	}

	isMissing(): this is Err<T, Missing> {
		return this.error instanceof Missing
	}

	ok(): Maybe<T> {
		return Maybe.nothing<T>()
	}

	err(): Maybe<E> {
		return Maybe.just(this.error)
	}

	and<U>(_: ResultE<U, E>): ResultE<U, E> {
		return new Err<U, E>(this.error)
	}

	andThen<U>(_: (e: T) => ResultE<U, E>): ResultE<U, E> {
		return new Err<U, E>(this.error)
	}

	or(res: ResultE<T, E>): ResultE<T, E> {
		return res
	}

	orElse<U>(op: (a: E) => ResultE<T, U>): ResultE<T, U> {
		return op(this.error)
	}

	unwrapOr<R>(def: R): T | R {
		return def
	}

	unwrapOrElse(op: (e: E) => T): T {
		return op(this.error)
	}

	unwrap(): T {
		throw new ResultUnwrapError(this.error)
	}

	caseOf<R>(pattern: ResultPatterns<T, E, R>) {
		const err = this.error
		if (pattern.Missing && err instanceof Missing) {
			return pattern.Missing(err)
		} else {
			return pattern.Err(err)
		}
	}

	equals(other: ResultE<T, E>) {
		if (other instanceof Err) {
			return eq(this.error, other.error)
		} else {
			return false
		}
	}

	public toString(): string {
		return `Err ${this.error.toString()}`
	}

	cast<R>(): Ok<R, E> {
		return this as any
	}

	unsafeCast<A>(): Err<A, E> {
		return this as any
	}

	res(): Res<T> {
		if (this.error instanceof Error) {
			return this.error
		} else {
			throw new Error('Only `Error` can be casted to Res<T>')
		}
	}
}

class ResultUnwrapError extends Error {
	err: Error
	message: string
	constructor(err: any) {
		super()

		// Use V8's native method if available, otherwise fallback
		if ('captureStackTrace' in Error) {
			(Error as any).captureStackTrace(this, ResultUnwrapError)
		} else {
			this.stack = (new Error()).stack
		}

		this.err = err
		this.message = `Result.Err was unwrapped.\n	Error is: ` + err + '\n	With stack: ' + err.stack
	}
}

ResultUnwrapError.prototype.name = 'ResultUnwrapError'

export type Result<T> = ResultE<T, Error>

export namespace Result {
	export function wrap<T>(value: T | Error | undefined): Result<T> {
		if (!(value instanceof Error)) {
			return Result.missing(value)
		} else {
			return Result.err<T>(value)
		}
	}

	export function wrapRes<T>(value: Res<T>): Result<T> {
		if (!(value instanceof Error)) {
			return Result.ok(value)
		} else {
			return Result.err<T>(value)
		}
	}

	export function ok<T>(value: T): Ok<T, Error> {
		return new Ok<T, Error>(value)
	}

	export function err<T>(err: Error): Err<T, Error> {
		return new Err<T, Error>(err)
	}

	export const isResult = ResultE.isResult
	export const all = ResultE.all
	export const missing = ResultE.missing
}

export default Result
