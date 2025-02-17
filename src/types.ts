// export type MaybePromise<T> = T | PromiseLike<T> | Promise<T>

export type Env = Partial<{
  Bindings: object
  States: object
}>

export type Next = () => Promise<Response | void>

export type Context<E extends Env> = {
  request: Request
  state: E["States"]
  next: Next
}

export type Handler<E extends Env> = (argument: Context<E>) => Response | void | Promise<Response | void>
export type NotFoundHandler<T> = (argument: Context<T>) => Response
export type ErrorHandler<T> = (argument: Context<T>, error: unknown) => Response
