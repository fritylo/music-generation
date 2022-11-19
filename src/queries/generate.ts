import { getResponseError, instance } from "./_instance";

export async function generate(personalAccessToken: string, duration: number, genres: string[], mode: 'track'|'loop') {
    const result = await instance.post('/RecordTrackTTM', {
        "method": "RecordTrackTTM",
        "params": {
            "pat": personalAccessToken,
            "duration": duration,
            "tags": genres,
            "mode": mode,
        }
    });
    
    const error = getResponseError(result);
    
    return { result, error };
}