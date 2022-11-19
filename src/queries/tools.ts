import axios, { AxiosError } from "axios";

export async function untilUrlCreated(
    url: string, 
    allowedErrorCodes: number[], 
    maxAttemptsCount = 20, 
    attemptsInterval = 1000
): Promise<boolean|undefined> {
    try {
        const result = await axios.head(url);
        
        if (result.status === 200)
            return true;
    } catch (error) {
        if (error instanceof AxiosError) {
            const result = error.response;
            const status = result?.status || -1;

            if (!allowedErrorCodes.includes(status) || maxAttemptsCount === 0)
                return false;
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(
                        untilUrlCreated(url, allowedErrorCodes, maxAttemptsCount - 1, attemptsInterval)
                    );
                }, attemptsInterval);
            });
        } else {
            throw error;
        }
    }
}