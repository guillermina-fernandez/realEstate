import { useState, useEffect } from 'react';
import { useDataContext } from '../context/DataContext';
import { fetchRelatedModelObjectsAPI, fetchModelObjectsAPI } from "../services/api_crud";
import { useFormHandler } from '../myScripts/useFormHandler';

function FormAgenda({ formRef, initialData }) {
    const [realEstates, setRealEstates] = useState([]);
    const [taxes, setTaxes] = useState([]);
    const [actionDetailOpts, setActionDetailOpts] = useState([]);
    const [otherAction, setOtherAction] = useState(false);
    const [showRealEstate, setShowRealEstate] = useState(false);
    const [realEstateRequired, setRealEstateRequired] = useState(false);
    const [showTax, setShowTax] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [showAgendaValue, setShowAgendaValue] = useState(false);
    const [agendaValueRequired, setAgendaValueRequired] = useState(false);
    const [agendaValueReadonly, setAgendaValueReadonly] = useState(false);
    const [selectedRealEstate, setSelectedRealEstate] = useState('');
    const [selectedAction, setSelectedAction] = useState('PAGAR');
    const [selectedActionDetail, setSelectedActionDetail] = useState('IMPUESTO');
    const [agendaValue, setAgendaValue] = useState('');

    const { setError, setLoading } = useDataContext();
    const { register, onSubmit, setValue } = useFormHandler(initialData);

    useEffect(() => {
        const loadEstates = async () => {
            try {
                setLoading(true);
                const fetchedData = await fetchModelObjectsAPI('propiedad', '0');
                setRealEstates(fetchedData);
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadEstates();
    }, []);

    useEffect(() => {
        if (initialData) {
            const action = initialData.action || 'PAGAR';
            const actionDetail = initialData.action_detail || 'IMPUESTO';
            setSelectedAction(action);
            setSelectedActionDetail(actionDetail);
            if (initialData.real_estate) {
                setSelectedRealEstate(initialData.real_estate);
            }
            if (initialData.agenda_value) {
                setAgendaValue(initialData.agenda_value);
            }
            handleActionChange(action, actionDetail, initialData.real_estate);
        } else {
            handleActionChange('PAGAR', 'IMPUESTO', '');
        }
    }, [initialData]);

    useEffect(() => {
        if (selectedRealEstate && selectedActionDetail === 'IMPUESTO' && selectedAction === 'PAGAR') {
            loadTaxesForRealEstate(selectedRealEstate);
        }
    }, [selectedRealEstate, selectedActionDetail, selectedAction]);

    const loadTaxesForRealEstate = async (realEstateId) => {
        try {
            setLoading(true);
            const fetchedTaxes = await fetchRelatedModelObjectsAPI('impuesto', 2, 'real_estate', realEstateId);
            const taxesWithNames = fetchedTaxes.map(tax => {
                let tax_name = '';
                if (tax.tax_type) {
                    if (tax.tax_type.tax_type === 'OTRO') {
                        tax_name += tax.tax_other;
                    } else {
                        tax_name += tax.tax_type.tax_type;
                    }
                }
                tax_name += ` (${tax.tax_nbr1}`;
                if (tax.tax_nbr2) {
                    tax_name += ` / ${tax.tax_nbr2}`;
                }
                tax_name += ')';

                return {
                    ...tax,
                    tax_name
                };
            });

            setTaxes(taxesWithNames);
            if (initialData?.tax) {
                setValue('tax', initialData.tax);
            } else if (taxesWithNames.length > 0) {
                setValue('tax', taxesWithNames[0].id);
            }
        } catch (err) {
            setError(err);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRentValue = async (realEstateId, agendaDate) => {
        try {
            setLoading(true);

            const fetchedRent = await fetchRelatedModelObjectsAPI('alquiler', '0', 'real_estate', realEstateId);
            const lastRent = fetchedRent?.length ? fetchedRent[0] : null;

            if (!lastRent) {
                setAgendaValue('');
                setValue('agenda_value', '');
                return;
            }

            const fetchedSteps = await fetchRelatedModelObjectsAPI('escalon', '0', 'rent', lastRent.id);

            if (!fetchedSteps || fetchedSteps.length === 0) {
                setAgendaValue('');
                setValue('agenda_value', '');
                return;
            }

            const selectedDate = agendaDate || document.getElementById('agenda_date')?.value;

            if (!selectedDate) {
                setAgendaValue('');
                setValue('agenda_value', '');
                return;
            }

            const match = fetchedSteps.find(
                (step) => selectedDate >= step.date_from && selectedDate <= step.date_to
            );

            const rentValue = match?.rent_value ?? '';

            setAgendaValue(rentValue);
            setValue('agenda_value', rentValue);

        } catch (err) {
            setError(err);
            console.error(err);
            setAgendaValue('');
            setValue('agenda_value', '');
        } finally {
            setLoading(false);
        }
    };

    function handleActionChange(action, currentActionDetail = null, currentRealEstate = null) {
        setSelectedAction(action);

        // Reset fields
        setValue('detail', '');
        setAgendaValue('');
        setValue('agenda_value', '');
        setValue('tax', '');

        if (action === 'PAGAR') {
            setOtherAction(false);
            setActionDetailOpts(['IMPUESTO', 'OTRO']);
            const actionDetail = currentActionDetail || 'IMPUESTO';
            setSelectedActionDetail(actionDetail);
            setValue('action_detail', actionDetail);
            handleActionDetailChange(action, actionDetail, currentRealEstate);
        } else if (action === 'COBRAR') {
            setOtherAction(false);
            setActionDetailOpts(['ALQUILER', 'OTRO']);
            const actionDetail = currentActionDetail || 'ALQUILER';
            setSelectedActionDetail(actionDetail);
            setValue('action_detail', actionDetail);
            handleActionDetailChange(action, actionDetail, currentRealEstate);
        } else {
            // OTRO
            setOtherAction(true);
            setActionDetailOpts([]);
            setSelectedActionDetail('OTRO');
            setValue('action_detail', 'OTRO');
            setShowRealEstate(true);
            setRealEstateRequired(false);
            setShowTax(false);
            setShowDetail(true);
            setShowAgendaValue(true);
            setAgendaValueRequired(false); // Not required for OTRO action
            setAgendaValueReadonly(false);
        }
    }

    function handleActionDetailChange(action, actionDetail, currentRealEstate = null) {
        setSelectedActionDetail(actionDetail);
        setValue('detail', '');
        setAgendaValue('');
        setValue('agenda_value', '');
        setValue('tax', '');
        setTaxes([]);

        if (action === 'PAGAR') {
            if (actionDetail === 'IMPUESTO') {
                setShowRealEstate(true);
                setRealEstateRequired(true);
                setShowTax(true);
                setShowDetail(false);
                setShowAgendaValue(true);
                setAgendaValueRequired(true);
                setAgendaValueReadonly(false);

                // Load taxes if real estate is already selected
                if (currentRealEstate || selectedRealEstate) {
                    loadTaxesForRealEstate(currentRealEstate || selectedRealEstate);
                }
            } else if (actionDetail === 'OTRO') {
                setShowRealEstate(true);
                setRealEstateRequired(false);
                setShowTax(false);
                setShowDetail(true);
                setShowAgendaValue(true);
                setAgendaValueRequired(true);
                setAgendaValueReadonly(false);
            }
        } else if (action === 'COBRAR') {
            if (actionDetail === 'ALQUILER') {
                setShowRealEstate(true);
                setRealEstateRequired(true);
                setShowTax(false);
                setShowDetail(false);
                setShowAgendaValue(true);
                setAgendaValueRequired(true);
                setAgendaValueReadonly(true);

                // Load rent value if real estate is already selected
                if (currentRealEstate || selectedRealEstate) {
                    const agendaDate = initialData?.agenda_date || document.getElementById('agenda_date')?.value;
                    loadRentValue(currentRealEstate || selectedRealEstate, agendaDate);
                }
            } else if (actionDetail === 'OTRO') {
                setShowRealEstate(true);
                setRealEstateRequired(false);
                setShowTax(false);
                setShowDetail(false);
                setShowAgendaValue(true);
                setAgendaValueRequired(true);
                setAgendaValueReadonly(false);
            }
        }
    }

    function handleRealEstateChange(realEstateId) {
        setSelectedRealEstate(realEstateId);

        if (selectedAction === 'PAGAR' && selectedActionDetail === 'IMPUESTO') {
            // Taxes will be loaded by useEffect
            setValue('tax', '');
            setTaxes([]);
        } else if (selectedAction === 'COBRAR' && selectedActionDetail === 'ALQUILER') {
            const agendaDate = document.getElementById('agenda_date')?.value;
            loadRentValue(realEstateId, agendaDate);
        }
    }

    function handleDateChange(date) {
        setValue('agenda_date', date);

        // If we're in COBRAR - ALQUILER mode and have a real estate selected,
        // recalculate the rent value based on the new date
        if (selectedAction === 'COBRAR' && selectedActionDetail === 'ALQUILER' && selectedRealEstate) {
            loadRentValue(selectedRealEstate, date);
        }
    }

    return (
        <form ref={formRef} onSubmit={onSubmit}>
            <div className='hstack w-100'>
                <div className='w-100'>
                    <label htmlFor='agenda_date'>FECHA</label>
                    <input
                        type='date'
                        className='form-control form-control-sm'
                        id='agenda_date'
                        name='agenda_date'
                        {...register('agenda_date')}
                        required
                        autoFocus
                        onChange={(e) => handleDateChange(e.target.value)}
                    />
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='action'>ACCION</label>
                    <select
                        className='form-select form-select-sm'
                        id='action'
                        name='action'
                        {...register('action', {
                            onChange: (e) => handleActionChange(e.target.value)
                        })}
                        value={selectedAction}
                        onChange={(e) => handleActionChange(e.target.value)}
                    >
                        <option value="PAGAR">PAGAR</option>
                        <option value="COBRAR">COBRAR</option>
                        <option value="OTRO">OTRO</option>
                    </select>
                </div>
                <div className='w-100 ms-2'>
                    <label htmlFor='action_detail'>DETALLE</label>
                    {!otherAction ? (
                        <select
                            key={actionDetailOpts.join('-')}
                            className='form-select form-select-sm'
                            id='action_detail'
                            name='action_detail'
                            {...register('action_detail', {
                                onChange: (e) => handleActionDetailChange(selectedAction, e.target.value)
                            })}
                            value={selectedActionDetail}
                            onChange={(e) => handleActionDetailChange(selectedAction, e.target.value)}
                        >
                            {actionDetailOpts.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            className='form-control form-control-sm'
                            id='action_detail'
                            name='action_detail'
                            value="OTRO"
                            readOnly
                            {...register('action_detail')}
                        />
                    )}
                </div>
            </div>

            {showRealEstate && (
                <div className='hstack w-100 mt-3'>
                    <div className='w-100'>
                        <label htmlFor='real_estate'>PROPIEDAD</label>
                        <select
                            className='form-select form-select-sm'
                            id='real_estate'
                            name='real_estate'
                            {...register('real_estate', {
                                onChange: (e) => handleRealEstateChange(e.target.value)
                            })}
                            required={realEstateRequired}
                            value={selectedRealEstate}
                            onChange={(e) => handleRealEstateChange(e.target.value)}
                        >
                            <option value="">Seleccione una propiedad</option>
                            {realEstates.map(re => (
                                <option key={re.id} value={re.id}>{re.re_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {showTax && (
                <div className='hstack w-100 mt-3'>
                    <div className='w-100'>
                        <label htmlFor='tax'>IMPUESTO</label>
                        <select
                            className='form-select form-select-sm'
                            id='tax'
                            name='tax'
                            {...register('tax')}
                            required
                            disabled={!selectedRealEstate || taxes.length === 0}
                        >
                            <option value="">
                                {!selectedRealEstate ? 'Seleccione una propiedad primero' :
                                    taxes.length === 0 ? 'No hay impuestos disponibles' :
                                        'Seleccione un impuesto'}
                            </option>
                            {taxes.map(tax => (
                                <option key={tax.id} value={tax.id}>{tax.tax_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {showDetail && (
                <div className='hstack w-100 mt-3'>
                    <div className='w-100'>
                        <label htmlFor='detail'>DETALLE ADICIONAL</label>
                        <input
                            className='form-control form-control-sm'
                            id='detail'
                            name='detail'
                            {...register('detail')}
                            required
                            placeholder='Ingrese un detalle'
                        />
                    </div>
                </div>
            )}

            {showAgendaValue && (
                <div className='hstack w-100 mt-3'>
                    <div className='w-100'>
                        <label htmlFor='agenda_value'>IMPORTE</label>
                        <input
                            type='number'
                            step='0.01'
                            min='0'
                            className='form-control form-control-sm'
                            id='agenda_value'
                            name='agenda_value'
                            {...register('agenda_value')}
                            required={agendaValueRequired}
                            readOnly={agendaValueReadonly}
                            value={agendaValue}
                            onChange={(e) => setAgendaValue(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className='hstack w-100 mt-3'>
                <div className='w-100'>
                    <label htmlFor='observations'>OBSERVACIONES</label>
                    <textarea
                        className='form-control form-control-sm'
                        id='observations'
                        name='observations'
                        {...register('observations')}
                        rows='3'
                        placeholder='Observaciones opcionales'
                    />
                </div>
            </div>
        </form>
    );
}

export default FormAgenda;