export class Observer {
  handlers: ObserverHandlers;
  isUnsubscribed: boolean;
  _unsubscribe: () => void;

  constructor(handlers: ObserverHandlers) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: RequestType) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: Error) {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

type SubscribeFunctionType = (observer: Observer) => () => void;
type Handler = (
  value?: RequestType | Error
) => { status: HTTPStatusCode } | void;
type ObserverHandlers = Partial<{
  next: Handler;
  error: Handler;
  complete: Handler;
}>;

class Observable {
  _subscribe: SubscribeFunctionType;

  constructor(subscribe: SubscribeFunctionType) {
    this._subscribe = subscribe;
  }

  static from(values: RequestType[]) {
    return new Observable((observer: Observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log("unsubscribed");
      };
    });
  }

  subscribe(obs: ObserverHandlers) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return {
      unsubscribe() {
        observer.unsubscribe();
      },
    };
  }
}

enum HTTPMethod {
  GET = "GET",
  POST = "POST",
}

enum HTTPStatusCode {
  Ok = 200,
  InternalServerError = 500,
}

type Roles = "admin" | "user";

type UserType = {
  name: string;
  age: number;
  roles: Roles[];
  createdAt: Date;
  isDeleted: boolean;
};

const userMock: UserType = {
  name: "User Name",
  age: 26,
  roles: ["user", "admin"],
  createdAt: new Date(),
  isDeleted: false,
};

type RequestType = {
  method: HTTPMethod;
  host: string;
  path: string;
  body?: object;
  params: object;
};

const requestsMock: RequestType[] = [
  {
    method: HTTPMethod.POST,
    host: "service.example",
    path: "user",
    body: userMock,
    params: {},
  },
  {
    method: HTTPMethod.GET,
    host: "service.example",
    path: "user",
    params: {
      id: "3f5h67s4s",
    },
  },
];

const handleRequest: Handler = (request) => {
  // handling of request
  return { status: HTTPStatusCode.Ok };
};
const handleError: Handler = (error) => {
  // handling of error
  return { status: HTTPStatusCode.InternalServerError };
};
const handleComplete: Handler = () => console.log("complete");

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
});

subscription.unsubscribe();
