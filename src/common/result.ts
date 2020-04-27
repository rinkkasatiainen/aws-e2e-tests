type ErrorReason = 'internal' | 'integration-not-allowed' | 'woo-integration' | 'integration';


export interface Errors<T> {
    ErrorX: ErrorX<T>
    ErrorY: ErrorY<T>
}

export type ErrorType = keyof Errors<any>

export interface DomainError<T extends ErrorType, U> {
    type: T;
    input?: U;
    domain: string;
    reason: ErrorReason;
}

export interface ErrorX<T> extends DomainError<'ErrorX', T> {
    // tslint:disable-next-line:no-any
    message: any;
}

export interface ErrorY<T> extends DomainError<'ErrorY', T> {
    // tslint:disable-next-line:no-any
    message: any;
    dataForY: number;
}


export interface Result<T extends ErrorType, U, V extends DomainError<T, U>> {
    success?: U;
    error?: V;
}
