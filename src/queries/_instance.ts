import axios, { AxiosResponse } from "axios";

export const instance  = axios.create({
    baseURL: 'https://api-b2b.mubert.com/v2',
});

interface ResponseError {
    message: string;
}

export function getResponseError(response: AxiosResponse): ResponseError | false {
    if (response.status !== 200)
        return { message: response.statusText };

    if ('error' in response.data)
        return { message: response.data.error.text };

    return false;
}