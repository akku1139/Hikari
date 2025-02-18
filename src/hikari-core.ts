import { compose } from "./compose"
import type { METHODS } from "./define"
import { SimpleRouter } from "./router"
import type { Router } from "./router/router-core"
import type { Handler, Context, NotFoundHandler, ErrorHandler, Env, GetPath } from "./types"
import { getPath, getPathNoStrict } from "./utils/url"

export type HikariOptions<E extends Env> = Partial<{
  notFound: NotFoundHandler<E>
  onError: ErrorHandler<E>
  strict: boolean
}>

export class HikariCore <
  E extends Env = {}
> {
  router: Router<E>

  notFoundHandler: NotFoundHandler<E>
  errorHandler: ErrorHandler<E>

  getPath: GetPath

  constructor(options?: HikariOptions<E>) {
    this.router = new SimpleRouter()
    this.notFoundHandler = options?.notFound ?? (() => new Response("404 Not Found", { status: 404 }))
    this.errorHandler = options?.onError ?? ((_, error) => {
      console.error(error)
      return new Response("Internal Server Error", { status: 500 })}
    )

    const strict = options?.strict ?? true
    this.getPath = strict ? getPath : getPathNoStrict
  }

  on(method: typeof METHODS[number], path: string, handlers: Array<Handler<E>>) {
    this.router.add(method.toUpperCase(), path, handlers)
    return this
  }

  fetch(request: Request): Response | Promise<Response> {
    if(request.method === "HEAD") {
      return (async () =>
        new Response(null, await this.fetch({
          ...request,
          method: "GET"
        }))
      )()
    }

    const handlers = this.router.match(
      request.method,
      this.getPath(request)
    )

    const context: Context<E> = {
      request,
      state: Object.create(null),
      next: () => new Promise(resolve => resolve()), // fake: dispatch(current + 1)
    }

    if(handlers.length === 0) {
      return this.notFoundHandler(context)
    }

    const composed = compose(handlers)

    return (async () => {
      try {
        const response = await composed(context)

        if(!response) {
          return this.errorHandler(context, new Error(
            "No Response was returned from handlers. Did you forget to return a Response object or `await next()`?"
          ))
        }

        return response
      } catch (error) {
        // Error
        return this.errorHandler(context, error)
      }
    })()
  }
}
