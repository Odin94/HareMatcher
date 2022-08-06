import { ChangeEvent, RefObject, useEffect, useRef, useState } from 'react';

export const useInput = (initialValue: any) => {
    const [value, setValue] = useState(initialValue);

    return {
        value,
        setValue,
        reset: () => setValue(""),
        bind: {
            value,
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setValue(event.target.value);
            }
        }
    };
};

export const useRepeat = <T>(callback: () => Promise<T> | (() => void), delay: number, enabled = true) => {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        function tick() {
            if (enabled) {
                const maybePromise = savedCallback.current();

                if (maybePromise instanceof Promise) {
                    maybePromise.then(() => {
                        timeout = setTimeout(tick, delay);
                    });
                } else {
                    timeout = setTimeout(tick, delay);
                }
            }
        }
        if (enabled) {
            timeout = setTimeout(tick, delay);
            return () => timeout && clearTimeout(timeout);
        }
    }, [delay, enabled]);
}

export const useFocus = (): [RefObject<HTMLInputElement>, () => void] => {
    const htmlElRef = useRef<HTMLInputElement>(null);
    const setFocus = () => {
        htmlElRef.current?.focus();
    };

    return [htmlElRef, setFocus];
}
