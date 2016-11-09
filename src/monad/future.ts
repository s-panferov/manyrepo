import Result from './result'

export type Cb<T> = (value: Result<T>) => void
export type Setup<T> = (complete: (value: T | Result<T>) => void) => void

export default class Future<T> {
    private subs: Cb<T>[] = []
    private value: Result<T>
    private completed: boolean = false

    static isFuture<T>(value: Future<T> | any): value is Future<T> {
        return value instanceof Future
    }

    static unit<T>(value: T): Future<T> {
        return new Future<T>((complete) => {
            complete(Result.ok(value))
        });
    }

    static error<T>(value: Error): Future<T> {
        return new Future<T>((complete) => {
            complete(Result.err<T>(value))
        });
    }

    static lift1<T, R>(fn: (value: Result<T>) => Result<R>): (fut: Future<T>) => Future<R> {
        return fut => fut.fmap<R>(fn);
    }

    constructor(setup: Setup<T>) {
        setup(this.complete.bind(this))
    }

    ready(cb: Cb<T>) {
        if (this.completed) {
            return cb(this.value)
        } else {
            this.subs.push(cb)
        }
    }

    fmap<R>(fun: (value: Result<T>) => R): Future<R>
    fmap<R>(fun: (value: Result<T>) => Result<R>): Future<R>
    fmap<R>(fun: (value: Result<T>) => Future<R>): Future<R>
    fmap<R>(fun: (value: Result<T>) => R | Result<R> | Future<R>): Future<R> {
        return new Future<R>((complete) => {
            this.ready(value => {
                const res = fun(value)

                if (Future.isFuture(res)) {
                    res.fmap(complete)
                } else {
                    complete(res)
                }
            })
        })
    }

    private complete(value: T | Result<T>) {
        // ensure immutability
        if (this.completed) {
            return
        }

        if (Result.isResult(value)) {
            this.value = value
        } else {
            this.value = Result.ok<T>(value);
        }

        this.completed = true;

        // notify subscribers
        for (let sub of this.subs) {
            sub(this.value);
        }

        // release all, we don't need this anymore
        this.subs = [];
    }

}