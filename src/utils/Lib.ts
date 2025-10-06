import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Lib = {

    setCookies({ name = "cookies", value = "", exp = 1 }: { name: string, value: string, exp: number | Date | undefined }) {
        Cookies.set(name, value, {
            expires: exp,
        });
    },
    removeCookies(keyName: string = '') {
        Cookies.remove(keyName);
    },
    getCookies(keyName: string) {
        return Cookies.get(keyName);
    },
    DecodeJwt(token: string | undefined | null = "") {
        try {
            if (token) {
                return jwtDecode(token);
            } else {
                return null
            }

        } catch (e) {
            return null;
        }
    },
    cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs));
    },
    expiredSec(millionSec: number) {
        const expiresInSeconds = millionSec - Date.now() / 1000;
        return expiresInSeconds / (24 * 60 * 60);
    },
    payloadFormat(payload: any, emptyApply: string | null = null) {
        // Deep copy the payload to avoid modifying the original
        let formatPayload: any = JSON.parse(JSON.stringify(payload));

        // Recursive function to process objects and arrays
        function processItem(item: any): any {
            // Handle arrays
            if (Array.isArray(item)) {
                return item.map((element: any) => processItem(element));
            }
            // Handle objects with a 'value' property
            if (typeof item === 'object' && item !== null && 'value' in item) {
                return item.value;
            }
            // Handle other objects
            if (typeof item === 'object' && item !== null) {
                const result: any = {};
                for (const key of Object.keys(item)) {
                    result[key] = processItem(item[key]);
                }
                return result;
            }
            // Handle strings (empty string replacement)
            if (typeof item === 'string' && !item.trim().length) {
                return emptyApply;
            }
            // Return unchanged for other types
            return item;
        }

        // Process the entire payload
        const result = processItem(formatPayload);


        return result;
    },

    selectOptions(value, OPTIONS: any = []) {
        return OPTIONS.find((item: any) => item.value == value)
    }

}

export default Lib