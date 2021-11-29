export const ClientError = (statusCode: number, message: string, exception: string) => {
    const clientError = {
        statusCode: statusCode,
        body: exception
    }
    console.log(message, clientError)
    return clientError
}

export const ServerError = (statusCode: number, message: string, error: Error) => {
    const serverError = {
        statusCode: statusCode,
        body: {message: error.message}
    }
    console.log(message, serverError)
    return serverError
}

export const Success = (statusCode: number, response: any) => {
    const success = {
        statusCode: statusCode,
        body: response
    }
    console.log('Succeeded.', JSON.stringify(success))
    return success
}