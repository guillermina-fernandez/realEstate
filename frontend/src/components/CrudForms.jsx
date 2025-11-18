import { useEffect, useState } from 'react';
import { validateCuit } from '../myScripts/myMainScript';
import { useBalanceFormHandler, useFormHandler } from '../myScripts/useFormHandler';
import { fetchModelObjectsAPI, fetchRelatedModelObjectsAPI } from '../services/api_crud';
import { useDataContext } from '../context/DataContext';
import TableChecks from './TableChecks';

function FormOwner({ formRef, initialData }) {
    const { register, onSubmit, errors } = useFormHandler(initialData);

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className="hstack">
                <div className="w-100">
                    <label htmlFor="lastName">APELLIDO</label>
                    <input className="form-control form-control-sm" id="lastName" name="lastName" {...register('last_name')} required autoFocus />
                </div>
                <div className="w-100 ms-2">
                    <label htmlFor="firstName">NOMBRE</label>
                    <input className="form-control form-control-sm" id="firstName" name="firstName" {...register('first_name')} required />
                </div>
            </div>
            <div className="mt-3" style={{ width: "50%" }}>
                <label htmlFor="cuit">CUIT</label>
                <input className="form-control form-control-sm centered-placeholder" id="cuit" name="cuit" placeholder="xx-xxxxxxxx-x" {...register('cuit', { validate: validateCuit })} required />
                {errors.cuit && <span className="text-danger">{errors.cuit.message}</span>}
            </div>
        </form>
    );
}


function FormReType({ formRef, initialData }) {
    const { register, onSubmit } = useFormHandler(initialData);

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className="w-100">
                <label htmlFor='re_type'>TIPO DE PROPIEDAD</label>
                <input className="form-control form-control-sm" id="re_type" name="re_type" {...register('re_type')} required autoFocus />
            </div>
        </form>
    )
}


function FormRealEstate({ formRef, initialData }) {
    const { register, onSubmit, setValue } = useFormHandler(initialData);
    const { setError, setLoading } = useDataContext();

    const [reTypes, setReTypes] = useState(null);
    const [ownersData, setOwnersData] = useState(null);
    const [selectedOwners, setSelectedOwners] = useState([]);
    const [selectedUsufructs, setSelectedUsufructs] = useState([]);
    const [initialOwners, setInitialOwners] = useState(null);
    const [initialUsufructs, setInitialUsufructs] = useState(null);

    useEffect(() => {
        setValue('owner', selectedOwners);
        setValue('usufruct', selectedUsufructs);
    }, [selectedOwners, selectedUsufructs, setValue])

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI('tipo_de_propiedad', "0");
                const flatData = Array.isArray(fetchedData) ? fetchedData.flat() : [];
                setReTypes(flatData)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const loadOwners = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI('propietario', "0");
                const flatData = Array.isArray(fetchedData) ? fetchedData.flat() : [];
                setOwnersData(flatData)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTypes();
        loadOwners();

        return () => { }

    }, []);

    useEffect(() => {
        if (initialData) {
            setInitialOwners(initialData.owner);
            setInitialUsufructs(initialData.usufruct);
        }
    }, [initialData])

    return (
        <form ref={formRef} onSubmit={(onSubmit)}>
            <div className='w-100'>
                <label htmlFor="re_type">TIPO</label>
                <select className="form-select form-select-sm" id="re_type" name="re_type" {...register('re_type')} defaultValue="" required autoFocus>
                    <option key="0" value="" disabled></option>
                    {reTypes && reTypes.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.re_type}</option>
                    ))}
                </select>
            </div>
            <div className="w-100 mt-3">
                <label htmlFor='address'>DIRECCION</label>
                <input className="form-control form-control-sm" id="address" name="address" {...register('address')} required />
            </div>
            <div className="hstack w-100 mt-3">
                <div className='w-100'>
                    <label htmlFor='floor'>PISO</label>
                    <input className="form-control form-control-sm" id="floor" name="floor" {...register('floor')} type="number" step="1" />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='unit'>UNIDAD</label>
                    <input className="form-control form-control-sm" id="unit" name="unit" {...register('unit')} type="number" step="1" min="0" />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='has_garage'>CON COCHERA</label>
                    <select className="form-select form-select-sm" id="has_garage" name="has_garage" {...register('has_garage')}>
                        <option value="NO">NO</option>
                        <option value="SI">SI</option>
                    </select>
                </div>
            </div>
            <hr></hr>
            <div className="w-100 mt-3">
                <label className='mb-2'>PROPIETARIO/S</label>
                <TableChecks objs={ownersData} onSelectionChange={setSelectedOwners} initialData={initialOwners} />
            </div>
            <div className="w-100 mt-3">
                <label className='mb-2'>USUFRUCTO</label>
                <TableChecks objs={ownersData} onSelectionChange={setSelectedUsufructs} initialData={initialUsufructs} />
            </div>
            <hr></hr>
            <div className="hstack w-100 mt-3">
                <div className='w-100'>
                    <label htmlFor='buy_date'>FECHA COMPRA</label>
                    <input className="form-control form-control-sm" id="buy_date" name="buy_date" type="date" {...register('buy_date')} />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='buy_value'>VALOR COMPRA</label>
                    <input className="form-control form-control-sm" id='buy_value' name='buy_value' {...register('buy_value')} />
                </div>
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='observations'>OBSERVACIONES</label>
                <textarea className="form-control form-control-sm" id="observations" name="observations" {...register('observations')}></textarea>
            </div>
        </form>
    )
}


function FormTax({ obj_id, formRef, initialData }) {
    const [taxTypes, setTaxTypes] = useState()
    const [hide, setHide] = useState(true)
    const { setError, setLoading } = useDataContext();
    const { register, onSubmit, setValue } = useFormHandler(initialData);

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI('tipo_de_impuesto', '0');
                const flatData = Array.isArray(fetchedData) ? fetchedData.flat() : [];
                setTaxTypes(flatData)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTypes();

        return () => { }
    }, [])

    useEffect(() => {
        hide && setValue('tax_other', '');
    }, [hide, setValue]);

    useEffect(() => {
        if (!taxTypes || taxTypes.length === 0) return;

        if (initialData?.tax_type) {
            setValue('tax_type', initialData.tax_type.id);
            setValue('tax_other', initialData.tax_other);
            handleChange(initialData.tax_type.id);
        } else {
            setValue('tax_type', '')
        }
    }, [taxTypes, setValue]);

    const handleChange = (optValue) => {
        [1, "1"].includes(optValue) ? setHide(false) : setHide(true)
    }

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div>
                {!initialData?.real_estate &&
                    <input type="number" id="real_estate" name="real_estate" value={parseInt(obj_id)} {...register('real_estate')} hidden readOnly />
                }
            </div>
            <div className="w-100">
                <label htmlFor='tax_type'>TIPO</label>
                <select className='form-select form-select-sm' id='tax_type' name='tax_type' {...register("tax_type", { onChange: (e) => handleChange(e.target.value) })} required autoFocus>
                    <option value="" disabled></option>
                    {taxTypes && taxTypes.map(item => (
                        <option key={item.id} value={item.id}>{item.tax_type}</option>
                    ))}
                </select>
            </div>
            <div className="w-100" hidden={hide}>
                <label htmlFor='tax_other'>NOMBRE</label>
                <input className="form-control form-control-sm" id="tax_other" name="tax_other" placeholder='Nombre/Entidad...' {...register('tax_other')} required={!hide} />
            </div>
            <div className='hstack mt-3'>
                <div className='w-100'>
                    <label htmlFor='tax_nbr1'>NÚMERO</label>
                    <input className="form-control form-control-sm" id='tax_nbr1' name='tax_nbr1' {...register('tax_nbr1')} required />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='tax_nbr2'>NÚMERO SEC</label>
                    <input className="form-control form-control-sm" id='tax_nbr2' name='tax_nbr2' {...register('tax_nbr2')} />
                </div>
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor="taxed_person">TITULAR</label>
                <input className="form-control form-control-sm" id='taxed_person' name='taxed_person'{...register('taxed_person')} />
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='observations'>OBSERVACIONES</label>
                <input className="form-control form-control-sm" id='observations' name='observations' {...register('observations')} />
            </div>
        </form>
    )
}


function FormTaxType({ formRef, initialData }) {
    const { register, onSubmit } = useFormHandler(initialData);

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className="w-100">
                <label htmlFor='tax_type'>TIPO DE IMPUESTO</label>
                <input className='form-control form-control-sm' id='tax_type' name='tax_type' {...register('tax_type')} required autoFocus />
            </div>
        </form>
    )
}


function FormRent({ obj_id, formRef, initialData }) {
    const { register, onSubmit, setValue } = useFormHandler(initialData);
    const { setError, setLoading } = useDataContext();

    const [tenantsData, setTenantsData] = useState(null);
    const [selectedTenants, setSelectedTenants] = useState([]);
    const [initialTenants, setInitialTenants] = useState(null);

    useEffect(() => {
        setValue('tenant', selectedTenants);
    }, [selectedTenants, setValue])

    useEffect(() => {
        const loadTenants = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI('inquilino', '0');
                const flatData = Array.isArray(fetchedData) ? fetchedData.flat() : [];
                setTenantsData(flatData)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTenants();

        return () => { }

    }, []);

    useEffect(() => {
        if (initialData?.tenant && Array.isArray(initialData.tenant)) {
            const tenantIds = initialData.tenant.map(t => Number(t.id));
            setInitialTenants(tenantIds);
        }
    }, [initialData]);

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div>
                {!initialData?.real_estate &&
                    <input type="number" id="real_estate" name="real_estate" value={parseInt(obj_id)} {...register('real_estate')} hidden readOnly />
                }
            </div>
            <div className='hstack w-100'>
                <div className='w-100'>
                    <label htmlFor='date_from'>FECHA INICIO</label>
                    <input className='form-control form-control-sm' type='date' id='date_from' name='date_from' {...register('date_from')} autoFocus />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='date_to'>FECHA HASTA</label>
                    <input className='form-control form-control-sm' type='date' id='date_to' name='date_to' {...register('date_to')} />
                </div>
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='actualization'>ACTUALIZACIÓN</label>
                <input className='form-control form-control-sm' id='actualization' name='actualization' {...register('actualization')} />
            </div>
            <div className="w-100 mt-3">
                <label className='mb-2'>INQUILINO/S</label>
                <TableChecks objs={tenantsData} onSelectionChange={setSelectedTenants} initialData={initialTenants} />
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='administrator'>ADMINISTRA</label>
                <input className='form-control form-control-sm' id='administrator' name='administrator' {...register('administrator')} />
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='observations'>OBSERVACIONES</label>
                <input className='form-control form-control-sm' id='observations' name='observations' {...register('observations')} />
            </div>
        </form>
    )
}


function FormRentStep({ obj_id, formRef, initialData }) {
    const { register, onSubmit } = useFormHandler(initialData);
    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div>
                {!initialData?.rent &&
                    <input type="number" id="rent" name="rent" value={parseInt(obj_id)} {...register('rent')} hidden readOnly />
                }
            </div>
            <div className='hstack w-100'>
                <div className='w-100'>
                    <label htmlFor='date_from'>FECHA DESDE</label>
                    <input className='form-control form-control-sm' type='date' id='date_from' name='date_from' {...register('date_from')} autoFocus />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='date_to'>FECHA HASTA</label>
                    <input className='form-control form-control-sm' type='date' id='date_to' name='date_to' {...register('date_to')} />
                </div>
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='rent_value'>IMPORTE</label>
                <input className='form-control form-control-sm' id='rent_value' name='rent_value' {...register('rent_value')} />
            </div>
            <div className='w-100 mt-3'>
                <label htmlFor='observations'>OBSERVACIONES</label>
                <input className='form-control form-control-sm' id='observations' name='observations' {...register('observations')} />
            </div>
        </form>
    )
}


function FormExpense({ obj_id, formRef, initialData }) {
    const [taxes, setTaxes] = useState([])
    const [hide, setHide] = useState(true)
    const { setError, setLoading } = useDataContext();
    const { register, onSubmit, setValue } = useBalanceFormHandler('gasto', initialData);

    useEffect(() => {
        const loadTaxes = async () => {
            try {
                const fetchedData = await fetchRelatedModelObjectsAPI('impuesto', '1', 'real_estate', obj_id);
                const newTaxes = fetchedData.map(tax => {
                    const tax_id = tax.id;
                    const tax_str = tax.tax_type.tax_type === 'OTRO' ? tax.tax_other : tax.tax_type.tax_type;
                    return { id: tax_id, tax_text: tax_str };
                });
                setTaxes(newTaxes);
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadTaxes();
    }, []);

    useEffect(() => {
        if (!taxes || taxes.length === 0) return;
        if (initialData) {
            handleChange(initialData.expense_type)
            initialData?.tax && setValue('tax', initialData.tax.id)
        }
    }, [taxes, setValue]);

    const handleChange = (optValue) => {
        if (optValue == 'OTRO') {
            setHide(false)
            setValue('tax', null)
        } else {
            setHide(true)
            setValue('other_expense', '')
        }
    }

    return (
        <>
            <form ref={formRef} onSubmit={onSubmit}>
                <div>
                    {!initialData?.real_estate &&
                        <input type="number" id="real_estate" name="real_estate" value={parseInt(obj_id)} {...register('real_estate')} hidden readOnly />
                    }
                </div>
                <div className='hstack w-100'>
                    <div className="w-100">
                        <label htmlFor='pay_date'>FECHA</label>
                        <input className='form-control form-control-sm' type='date' id='pay_date' name='pay_date' defaultValue={new Date().toISOString().split('T')[0]} {...register('pay_date')} required autoFocus />
                    </div>
                    <div className="w-100 ms-2">
                        <label htmlFor='pay_value'>IMPORTE</label>
                        <input className='form-control form-control-sm' type='number' step='0.01' min='0' id='pay_value' name='pay_value' {...register('pay_value')} required />
                    </div>
                </div>
                <div className='w-100 mt-3'>
                    <label htmlFor='expense_type'>TIPO DE GASTO</label>
                    <select className='form-select form-select-sm' id='expense_type' name='expense_type' {...register('expense_type', { onChange: (e) => handleChange(e.target.value) })} required>
                        <option>IMPUESTO</option>
                        <option>OTRO</option>
                    </select>
                </div>
                <div className='w-100 mt-3'>
                    <div className="w-100" hidden={hide}>
                        <label htmlFor='other_expense'>DETALLE</label>
                        <input className="form-control form-control-sm" id="other_expense" name="other_expense" {...register('other_expense')} required={!hide} />
                    </div>
                    <div className="w-100" hidden={!hide}>
                        <label htmlFor='tax'>DETALLE</label>
                        <select className='form-select form-select-sm' id='tax' name='tax' {...register('tax')} required={hide}>
                            <option></option>
                            {taxes && taxes.map(item => (
                                <option key={item.id} value={item.id}>{item.tax_text}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='w-100 mt-3'>
                    <label htmlFor='observations'>OBSERVACIONES</label>
                    <input className='form-control form-control-sm' id='observations' name='observations' {...register('observations')} />
                </div>
            </form>
        </>
    )
}


function FormCollect({ obj_id, formRef, initialData }) {
    const [hide, setHide] = useState(true);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [colType, setColType] = useState(initialData?.col_type || 'ALQUILER');

    const { register, onSubmit, setValue } = useBalanceFormHandler('cobro', initialData);

    useEffect(() => {
        if (initialData) handleChange(initialData.col_type);
    }, [initialData]);

    useEffect(() => {
        const loadRent = async () => {
            try {
                const fetchedRent = await fetchRelatedModelObjectsAPI('alquiler', '0', 'real_estate', obj_id);
                const lastRent = fetchedRent?.length ? fetchedRent[0] : null;

                const fetchedSteps = lastRent
                    ? await fetchRelatedModelObjectsAPI('escalon', '0', 'rent', lastRent.id)
                    : [];

                setSteps(fetchedSteps || []);
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadRent();
    }, [obj_id]);

    const handleChange = (optValue) => {
        setColType(optValue);
        setHide(optValue !== 'OTRO');
    };

    const handleDateBlur = (e) => {
        const selectedDate = e.target.value;

        if (colType !== 'ALQUILER' || !selectedDate || !steps.length) {
            setValue('col_value', 0);
            return;
        }

        const match = steps.find(
            (step) => selectedDate >= step.date_from && selectedDate <= step.date_to
        );

        const rentValue = match?.rent_value ?? 0;
        setValue('col_value', rentValue);
    };

    return (
        <>
            <form ref={formRef} onSubmit={onSubmit}>
                {!initialData?.real_estate && (
                    <input type="number" id="real_estate" name="real_estate" value={parseInt(obj_id)} {...register('real_estate')} hidden readOnly />
                )}
                <div className="w-100">
                    <label htmlFor="col_type">TIPO DE COBRO</label>
                    <select className="form-select form-select-sm" id="col_type" name="col_type" {...register('col_type', { onChange: (e) => handleChange(e.target.value), })} defaultValue={colType} required autoFocus >
                        <option>ALQUILER</option>
                        <option>OTRO</option>
                    </select>
                </div>
                <div className="w-100 mt-3" hidden={hide}>
                    <label htmlFor="col_other">DETALLE</label>
                    <input className="form-control form-control-sm" id="col_other" name="col_other" {...register('col_other')} required={!hide} />
                </div>
                <div className="hstack w-100 mt-3">
                    <div className="w-100">
                        <label htmlFor="col_date">FECHA</label>
                        <input className="form-control form-control-sm" type="date" id="col_date" name="col_date" defaultValue={new Date().toISOString().split('T')[0]} {...register('col_date', { onBlur: handleDateBlur })} required />
                    </div>
                    <div className="w-100 ms-2">
                        <label htmlFor="col_value">IMPORTE</label>
                        <input className="form-control form-control-sm" type="number" step="0.01" min="0" id="col_value" name="col_value" {...register('col_value')} required />
                    </div>
                </div>
                <div className="w-100 mt-3">
                    <label htmlFor="observations">OBSERVACIONES</label>
                    <input className="form-control form-control-sm" id="observations" name="observations" {...register('observations')} />
                </div>
            </form>
        </>
    );
}



/*
function FormAgenda({ formRef, initialData }) {
    const [realEstates, setRealEstates] = useState()
    const [actionDetailOpts, setActionDetailOpts] = useState([]);
    const [otherAction, setOtherAction] = useState(false)

    const { setError, setLoading } = useDataContext();
    const { register, onSubmit, setValue } = useFormHandler(initialData);

    useEffect(() => {
        const loadEstates = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI('propiedad', '0');
                const reNames = fetchedData.map(item => item.re_name);
                setRealEstates(reNames)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadEstates();

        return () => { }
    }, [])

    useEffect(() => {
        if (initialData?.action) {
            handleActionChange(initialData.action);
        } else {
            handleActionChange("PAGAR");
        }
    }, []);

    function handleActionChange(action) {
        setValue('detail', '');
        if (action === 'PAGAR') {
            setOtherAction(false);
            setActionDetailOpts(['IMPUESTO', 'OTRO']);
            setValue('action_detail', 'IMPUESTO');
        } else if (action === 'COBRAR') {
            setOtherAction(false);
            setActionDetailOpts(['ALQUILER', 'OTRO']);
            setValue('action_detail', 'ALQUILER');
        } else {
            setOtherAction(true);
            setActionDetailOpts([]);
            setValue('action_detail', 'OTRO')
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className='hstack w-100'>
                <div className='w-100'>
                    <label htmlFor='agenda_date'>FECHA</label>
                    <input type='date' className='form-control form-control-sm' id='agenda_date' name='agenda_date' {...register('agenda_date')} required autoFocus />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='action'>ACCION</label>
                    <select className='form-select form-select-sm' id='action' name='action'  {...register('action', { onChange: (e) => handleActionChange(e.target.value) })}>
                        <option>PAGAR</option>
                        <option>COBRAR</option>
                        <option>OTRO</option>
                    </select>
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='action_detail'>DETALLE</label>
                    {!otherAction ? (
                        <select key={actionDetailOpts.join('-')} className='form-select form-select-sm' id='action_detail' name='action_detail' {...register('action_detail')}>
                            {actionDetailOpts.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input className='form-control form-control-sm' id='detail' name='detail' {...register('detail')} required />
                    )}
                </div>
            </div>
            <div className='hstack w-100 mt-3'>
                <div className='w-100'>
                    <label htmlFor='agenda_value'>IMPORTE</label>
                    <input type='number' step='0.01' min='0' className='form-control form-control-sm' id='agenda_value' name='agenda_value'/>
                </div>
            </div>
            <div className='hstack w-100 mt-3'>
                <div className='w-100'>
                    <label htmlFor='agenda_value'>IMPORTE</label>
                    <input type='number' step='0.01' min='0' className='form-control form-control-sm' id='agenda_value' name='agenda_value'/>
                </div>
            </div>
        </form>
    )
}*/


export { FormOwner, FormReType, FormRealEstate, FormTax, FormTaxType, FormRent, FormRentStep, FormExpense, FormCollect};
