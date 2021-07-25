import React, { ChangeEvent, useState } from 'react';

export const useInput = (initialValue: any) => {
    const [value, setValue] = useState(initialValue);

    return {
        value,
        setValue,
        reset: () => setValue(""),
        bind: {
            value,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                setValue(event.target.value);
            }
        }
    };
};