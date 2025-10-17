import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useDataContext } from '../context/DataContext';
import { useBalanceContext } from '../context/BalanceContext';

export const useFormHandler = (initialData) => {
    const { submitForm } = useDataContext();
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    const onSubmit = handleSubmit((data) => {
        if (initialData?.id) {
            submitForm({ ...initialData, ...data }, 'update');
        } else {
            submitForm(data, 'create');
        }
    });

    return { register, onSubmit, errors, setValue };
}


export const useBalanceFormHandler = (modelName, initialData) => {
    const { submitForm } = useBalanceContext();
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

    useEffect(() => {
        if (initialData) reset(initialData);
    }, [initialData, reset]);

    const onSubmit = handleSubmit((data) => {
        if (initialData?.id) {
            submitForm(modelName, { ...initialData, ...data }, 'update');
        } else {
            submitForm(modelName, data, 'create');
        }
    });

    return { register, onSubmit, errors, setValue };
}