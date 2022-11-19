import { getResponseError, instance } from "./_instance";

export async function register(email: string) {
    const result = await instance.post('/GetServiceAccess', {
        "method": "GetServiceAccess",
        "params": {
            "email": email,
            "license": "ttmmubertlicense#f0acYBenRcfeFpNT4wpYGaTQIyDI4mJGv5MfIhBFz97NXDwDNFHmMRsBSzmGsJwbTpP1A6i07AXcIeAHo5",
            "token": "4951f6428e83172a4f39de05d5b3ab10d58560b8",
            "mode": "loop"
        }
    });
    
    const error = getResponseError(result);
    
    return { result, error };
}