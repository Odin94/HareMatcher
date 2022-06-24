export const apiVersion = "v1"
export const baseUrl = `localhost:8080`

// js implementation of Java's String.hashCode
export const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}

export const convertBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
            resolve(fileReader.result);
        }
        fileReader.onerror = (error) => {
            reject(error);
        }
    });
}

export const range = (start: number, end: number) => Array.from(Array(1 + end - start).keys());
