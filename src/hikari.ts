import type { METHODS } from "./define"
import { HikariCore, type HikariOptions } from "./hikari-core"
import type { Env, Handler } from "./types"

type MethodRoute<E extends Env> = (path: string, ...handlers: Array<Handler<E>>) => Hikari<E>

export class Hikari <
  E extends Env
> extends HikariCore <E> {

  constructor(options?: HikariOptions<E>) {
    super(options)
  }

  #methodRoute(method: typeof METHODS[number]) {
    return (path: string, ...handlers: Array<Handler<E>>): this => this.on(method, path, handlers)
  }
  get: MethodRoute<E> = this.#methodRoute("GET")
  post: MethodRoute<E> = this.#methodRoute("POST")
  put: MethodRoute<E> = this.#methodRoute("PUT")
  delete: MethodRoute<E> = this.#methodRoute("DELETE")
  // options = this.#methodRoute("OPTIONS")
  patch: MethodRoute<E> = this.#methodRoute("PATCH")
  use(path: string, ...handlers: Array<Handler<E>>): this {
    return this
      .on("GET", path, handlers)
      .on("POST", path, handlers)
      .on("PUT", path, handlers)
      .on("DELETE", path, handlers)
      .on("OPTIONS", path, handlers)
      .on("PATCH", path, handlers)
  }
  all: MethodRoute<E> = this.use
}
