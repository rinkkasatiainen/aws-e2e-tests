import { Callback, Context, Handler } from 'aws-lambda';

// @ts-ignore
export const handler: Handler = async (event: any, context: Context, cb: Callback) => {
    console.log('Executing FAKE lambda!', JSON.stringify(event));

    const action = `${event.httpMethod}:${event.path}`;

    let statusCode = 200;
    let responseBody: Object | [Object];

    switch (action) {
        // OPKassa endpoints
        case 'GET:/success/api':
            responseBody = {
                data: {
                    method: "GET",
                    path: event.path
                },
            };
            break;
        case 'POST:/success/api':
            responseBody = {
                data: {
                    method: "POST",
                    path: event.path
                },
            };
            break;
        default:
            responseBody = {
                status: 'missing fake api!',
                eventPath: action,
            };
    }

    const response = {
        statusCode,
        headers: {
            my_header: 'my_value',
        },
        body: JSON.stringify(responseBody),
        isBase64Encoded: false,
    };

    console.log('Returning from FAKE lambda lambda!', { response: JSON.stringify(responseBody) });

    return response
};

