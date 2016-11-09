export default Res
export type Res<T> = T | Error
export type Maybe<T> = T | undefined

import { Missing } from './result'

export namespace Maybe {
	/**
	 * Returns true if the option is a Some value
	 */
	export function isSome<T>(m: Maybe<T>): m is T {
		return typeof m !== 'undefined'
	}

	/**
	 * Returns true if the option is a None value
	 */
	export function isNone<T>(m: Maybe<T>): m is undefined {
		return !isSome(m)
	}

	/**
	 * Returns check result if the option is a Some value
	 */
	export function isSomeAnd<T>(m: Maybe<T>, fn: (a: T) => boolean): boolean {
		if (isSome(m)) {
			return fn(m)
		} else {
			return false
		}
	}

	/**
	 * Returns check result if the option is a None value
	 */
	export function isNoneAnd<T>(m: Maybe<T>, fn: () => boolean): boolean {
		if (isNone(m)) {
			return fn()
		} else {
			return false
		}
	}

	/**
	 * Returns the inner T of a Some(T). Throws an exception if the self value equals None.
	 */
	export function unwrap<T>(m: Maybe<T>): T {
		if (isSome(m)) {
			return m
		} else {
			throw 'None.unwrap'
		}
	}

	/**
	 * Returns the contained value or a default.
	 * @param def
	 */
	export function unwrapOr<T>(m: Maybe<T>): undefined
	export function unwrapOr<T>(m: Maybe<T>, def: null): null
	export function unwrapOr<T>(m: Maybe<T>, def: T): T
	export function unwrapOr<T>(m: Maybe<T>, def?: T | null): T | null | undefined {
		if (isSome(m)) {
			return m
		} else {
			return def
		}
	}

	/**
	 * Returns the contained value or computes it from a closure.
	 * @param f
	 */
	export function unwrapOrElse<T>(m: Maybe<T>, f: () => T): T {
		if (isSome(m)) {
			return m
		} else {
			return f()
		}
	}

	/**
	 * Maps an Option<T> to Option<U> by applying a function to a contained value
	 * @param f
	 */
	export function map<T, U>(m: Maybe<T>, f: (a: T) => U): Maybe<U> {
		if (isSome(m)) {
			return f(m)
		} else {
			return m
		}
	}

	/**
	 * Applies a function to the contained value or returns a default.
	 * @param def
	 * @param f
	 */
	export function mapOr<T, U>(m: Maybe<T>, def: U, f: (a: T) => U): U {
		if (isSome(m)) {
			return f(m)
		} else {
			return def
		}
	}

	/**
	 * Applies a function to the contained value or computes a default.
	 * @param def
	 * @param f
	 */
	export function mapOrElse<T, U>(m: Maybe<T>, def: () => U, f: (a: T) => U): U {
		if (isSome(m)) {
			return f(m)
		} else {
			return def()
		}
	}

	/**
	 * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err).
	 * @param err
	 */
	export function okOr<T>(m: Maybe<T>, err: Error): Res<T> {
		if (isSome(m)) {
			return m
		} else {
			return err
		}
	}

	/**
	 * Transforms the Option<T> into a Result<T, E>, mapping Some(v) to Ok(v) and None to Err(err()).
	 * @param err
	 */
	export function okOrElse<T>(m: Maybe<T>, err: () => Error): Res<T> {
		if (isSome(m)) {
			return m
		} else {
			return err()
		}
	}

	/**
	 * Returns None if the option is None, otherwise returns optb.
	 * @param optb
	 */
	export function and<T, U>(m: Maybe<T>, optb: Maybe<U>): Maybe<U> {
		if (isSome(m)) {
			return optb
		} else {
			return m
		}
	}

	/**
	 * Returns None if the option is None, otherwise calls f with the wrapped value and returns the result.
	 * Some languages call this operation flatmap.
	 * @param f
	 */
	export function andThen<T, U>(m: Maybe<T>, f: (a: T) => Maybe<U>): Maybe<U> {
		if (isSome(m)) {
			return f(m)
		} else {
			return m
		}
	}

	/**
	 * Returns the option if it contains a value, otherwise returns optb.
	 * @param optb
	 */
	export function or<T>(m: Maybe<T>, optb: Maybe<T>): Maybe<T> {
		if (isNone(m)) {
			return optb
		} else {
			return m
		}
	}

	/**
	 * Returns the option if it contains a value, otherwise calls f and returns the result.
	 * @param f
	 */
	export function orElse<T>(m: Maybe<T>, f: () => Maybe<T>): Maybe<T> {
		if (isNone(m)) {
			return f()
		} else {
			return m
		}
	}
}

export namespace Res {
	/**
	 * Returns true if the result is Ok
	 */
	export function isOk<T>(res: Res<T>): res is T {
		return !(res instanceof Error)
	}

	/**
	 * Returns true if the result is Err
	 */
	export function isErr<T>(res: Res<T>): res is Error {
		return res instanceof Error
	}

		/**
	 * Returns true if the result is Err(Missing)
	 */
	export function isMissing<T>(res: Res<T>): res is Missing {
		return res instanceof Missing
	}

	/**
	 * Convert from Result<T, E> to Maybe<T>
	 * Converts self into an Maybe<T>, and discarding the error, if any.
	 */
	export function ok<T>(res: Res<T>): Maybe<T> {
		if (isOk(res)) {
			return res
		} else {
			return undefined
		}
	}

	/**
	 * Convert from Result<T, E> to Maybe<E>
	 * Converts self into an Maybe<E>, and discarding the value, if any.
	 */
	export function err<T>(res: Res<T>): Maybe<Error> {
		if (isErr(res)) {
			return res
		} else {
			return undefined
		}
	}

	/**
	 * Maps a Result<T, E> to Result<U, E> by applying a function to an contained Ok value, leaving an Err value untouched.
	 * This function can be used to compose the results of two functions.
	 * @param fn
	 */
	export function map<T, U>(res: Res<T>, fn: (a: T) => U): Res<U> {
		if (Res.isOk(res)) {
			return fn(res)
		} else {
			return res
		}
	}

	/**
	 * Maps a Result<T, E> to Result<T, F> by applying a function to an contained Err value, leaving an Ok value untouched.
	 * This function can be used to pass through a successful result while handling an error.
	 */
	export function mapErr<T>(res: Res<T>, fn: (a: Error) => Error): Res<T> {
		if (Res.isErr(res)) {
			return fn(res)
		} else {
			return res
		}
	}

	/**
	 * Returns res if the result is Ok, otherwise returns the Err value of self.
	 */
	export function and<T, U>(current: Res<T>, next: Res<U>): Res<U> {
		if (Res.isOk(current)) {
			return next
		} else {
			return current
		}
	}

	/**
	 * Calls op if the result is Ok, otherwise returns the Err value of self.
	 * This function can be used for control flow based on result values.
	 */
	export function andThen<T, U>(res: Res<T>, op: (a: T) => Res<U>): Res<U> {
		if (Res.isOk(res)) {
			return op(res)
		} else {
			return res
		}
	}

	/**
	 * Returns res if the result is Err, otherwise returns the Ok value of self.
	 * @param res
	 */
	export function or<T>(current: Res<T>, next: Res<T>): Res<T> {
		if (Res.isErr(current)) {
			return next
		} else {
			return current
		}
	}

	/**
	 * Calls op if the result is Err, otherwise returns the Ok value of self.
	 * This function can be used for control flow based on result values.
	 * @param op
	 */
	export function orElse<T>(res: Res<T>, op: (a: Error) => Res<T>): Res<T> {
		if (Res.isErr(res)) {
			return op(res)
		} else {
			return res
		}
	}

	/**
	 * Unwraps a result, yielding the content of an Ok.
	 */
	export function unwrap<T>(res: Res<T>): T {
		if (isOk(res)) {
			return res
		} else {
			throw new ResUnwrapError(res)
		}
	}

	/**
	 * Unwraps a result, yielding the content of an Ok. Else it returns optb.
	 */
	export function unwrapOr<T>(res: Res<T>): T | null | undefined
	export function unwrapOr<T>(res: Res<T>, def: T): T
	export function unwrapOr<T>(res: Res<T>, def?: T | null | undefined): T | null | undefined {
		if (isOk(res)) {
			return res
		} else {
			return def
		}
	}

	/**
	 * Unwraps a result, yielding the content of an Err.
	 * @param op
	 */
	export function unwrapOrElse<T>(res: Res<T>, op: (u: Error) => T): T {
		if (isOk(res)) {
			return res
		} else {
			return op(res)
		}
	}

	export function missing<T>(value?: T | null | undefined, msg?: string, info?: any): Res<T> {
		if (value != null) {
			return value
		} else {
			return new Missing(msg, info)
		}
	}

	export function all<T>(results: Res<T>[]): Res<T[]> {
		const values: T[] = []
		for (const res of results) {
			if (Res.isOk(res)) {
				values.push(res)
			} else {
				return res
			}
		}

		return values
	}
}

class ResUnwrapError extends Error {
	err: Error
	message: string
	constructor(err: any) {
		super()

		// Use V8's native method if available, otherwise fallback
		if ('captureStackTrace' in Error) {
			(Error as any).captureStackTrace(this, ResUnwrapError)
		} else {
			this.stack = (new Error()).stack
		}

		this.err = err
		this.message = `Res.Err was unwrapped.\n	Error is: ` + err + '\n	With stack: ' + err.stack
	}
}

ResUnwrapError.prototype.name = 'ResUnwrapError'
