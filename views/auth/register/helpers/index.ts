const handlePressFoward = (
    fields: string[],
    values: any,
    onStepPress: (step: number) => void,
    target: number,
    setFieldError: (field: string, errorMsg: string) => void
) => {
    let error = false;

    const valueArray = fields.map(val => values[val]);

    valueArray.forEach((value, index) => {
        if (!value) {
            setFieldError(fields[index], 'Field cannot be empty');
            error = true;
        }
    });
    !error && onStepPress(target);
    error = false;
};

export { handlePressFoward };
