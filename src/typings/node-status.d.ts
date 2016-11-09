declare module "node-status" {
    interface StartOptions {
        invert?: boolean
        interval?: number
        pattern: string
    }

    interface CustomThis {
        count: number
        max?: number
    }

    interface ItemOptions {
        count?: number
        max?: number
        custom?: (this: CustomThis) => string
        precision?: number
        steps?: string[]
    }

    interface Item {
        count: number
        inc(num: number): void
        dec(num: number): void
        doneStep(success: boolean, message?: string): void
    }

    export function start(opts: StartOptions): void
    export function stop(): void
    export function setPattern(pattern: string): void
    export function clear(): void
    export function removeItem(name: string): void
    export function removeAll(): string
    export function addItem(name: string, options?: ItemOptions): Item
    export function console(): Console
}