import { spanishDate } from "../myScripts/myMainScript";
import Modal from "../components/Modal";
import { useDataContext, DataProvider } from "../context/DataContext";
import { BalanceProvider } from "../context/BalanceContext";
import { useEffect, useState } from "react";
import { Expenses, Collects } from "../components/Balance";
import Loading from "../components/Loading";


function get_persons(personsString) {
    let persons = personsString.replace(/, /g, ",\n");

    return persons
}


function ReTable() {
    const { modelData, setEditObj, showModal, openModal } = useDataContext();
    const [reType, setReType] = useState(null)
    const [buyDate, setBuyDate] = useState(null)
    const [ownersStr, setOwnersStr] = useState('')
    const [usufructStr, setUsufructStr] = useState('')

    // AGREGAR ELIMINAR PROPIEDAD Y TODAS SUS DEPENDENCIAS DESDE EL MODAL.

    useEffect(() => {
        if (modelData) {
            let re_type = modelData.re_type_name || '';
            const has_garage = modelData.has_garage;
            if (has_garage === 'SI') {
                re_type += ' CON COCHERA'
            }
            setReType(re_type);
            let buy_date = modelData.buy_date || null
            buy_date = buy_date && spanishDate(buy_date)
            setBuyDate(buy_date)
            const owners = modelData.owners ? get_persons(modelData.owners) : '';
            setOwnersStr(owners)
            const usufructs = modelData.usufructs ? get_persons(modelData.usufructs) : '';
            setUsufructStr(usufructs)
        }
    }, [modelData])

    const handleEdit = (editObj) => {
        openModal('edit');
        setEditObj(editObj)
    }

    return (
        <>
            {showModal && <Modal obj_id={modelData?.id} />}
            <table className="custom-fix-table border">
                <tbody>
                    <tr>
                        <th>Tipo:</th>
                        <td>{reType}</td>
                    </tr>
                    <tr>
                        <th>Dueños:</th>
                        <td style={{ whiteSpace: 'pre-line' }}>{ownersStr}</td>
                    </tr>
                    <tr>
                        <th>Usufructo:</th>
                        <td style={{ whiteSpace: 'pre-line' }}>{usufructStr}</td>
                    </tr>
                    <tr>
                        <th>Fecha Compra:</th>
                        <td>{buyDate}</td>
                    </tr>
                    <tr>
                        <th>Valor Compra:</th>
                        <td>{modelData?.buy_value}</td>
                    </tr>
                    <tr>
                        <th>Observaciones</th>
                        <td>{modelData?.observations}</td>
                    </tr>
                </tbody>
            </table>
            <button className="btn btn-secondary btn-sm w-100" type="button" onClick={() => handleEdit(modelData)}><i className="bi bi-pencil-square me-3"></i>Editar Propiedad</button>
        </>
    )
}


function Taxes({ obj_id }) {
    const { modelName, modelData, openModal, showModal, handleDelete, setEditObj, modelConfig } = useDataContext();
    const [taxData, setTaxData] = useState([])

    useEffect(() => {
        modelData && Array.isArray(modelData) && setTaxData(modelData)
    }, [modelData])

    const cols = modelConfig[modelName]['columns'];

    const handleEdit = (editObj) => {
        openModal('edit');
        setEditObj(editObj)
    }

    // Cannot use the <Table /> component since real_estate and tax_type return objects, not strings...
    return (
        <>
            {showModal && <Modal obj_id={obj_id} />}
            <div className="hstack">
                <h4>IMPUESTOS</h4>
                <button type="button" className="btn btn-primary btn-sm mb-2 ms-3" onClick={() => openModal('new')}>+</button>
            </div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        {cols.map((col, index) => <th key={`col${index}`} className="text-start">{col}</th>)}
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {taxData.map(tax => (
                        <tr key={tax.id}>
                            <td>{tax.tax_type.tax_type === 'OTRO' ? tax.tax_other : tax.tax_type.tax_type}</td>
                            <td>{tax.tax_nbr1}</td>
                            <td>{tax.tax_nbr2}</td>
                            <td>{tax.taxed_person}</td>
                            <td>{tax.observations}</td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(tax.id)}><i className="bi bi-trash3"></i></button>
                            </td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(tax)}><i className="bi bi-pencil-square"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}


function RentSteps({ obj_id }) {
    const { modelData, openModal, showModal, setEditObj, modelConfig, modelName } = useDataContext();
    const [stepData, setStepData] = useState([])

    useEffect(() => {
        modelData && Array.isArray(modelData) && setStepData(modelData)
    }, [modelData])

    const cols = modelConfig[modelName]['columns'];

    const handleEdit = (editObj) => {
        openModal('edit');
        setEditObj(editObj)
    }

    return (
        <>
            {showModal && <Modal obj_id={obj_id} />}
            <div className="hstack">
                <h4>ESCALONES</h4>
                <button type="button" className="btn btn-primary btn-sm mb-2 ms-3" onClick={() => openModal('new')}>+</button>
            </div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        {cols.map((col, index) => <th key={`col${index}`} className="text-start">{col}</th>)}
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {stepData.map(step => (
                        <tr key={step.id}>
                            <td>{spanishDate(step.date_from)}</td>
                            <td>{spanishDate(step.date_to)}</td>
                            <td>{step.rent_value}</td>
                            <td>{step.observations}</td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(step.id)}><i className="bi bi-trash3"></i></button>
                            </td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(step)}><i className="bi bi-pencil-square"></i></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    )
}


function Rent({ obj_id }) {
    const { modelData, openModal, showModal, setEditObj } = useDataContext();
    const [lastRent, setLastRent] = useState(null);
    const [tenants, setTenants] = useState([]);

    useEffect(() => {
        if (modelData && modelData.length > 0) {
            setLastRent(modelData[0])
        }
    }, [modelData])

    useEffect(() => {
        let tenants = ''
        if (lastRent) {
            (lastRent.tenant).forEach(item => {
                const last_name = item.last_name;
                const first_name = item.first_name;
                const cuit = item.cuit;
                tenants += `${last_name} ${first_name} (${cuit}),\n`;
            })
        }
        tenants = tenants.slice(0, -2);
        setTenants(tenants);
    }, [lastRent])

    const handleEdit = (editObj) => {
        openModal('edit');
        setEditObj(editObj)
    }

    return (
        <div className="hstack w-100">
            <div style={{ width: "40%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "40%" }}>
                {showModal && <Modal obj_id={obj_id} />}
                <div className="hstack">
                    <h4>ALQUILER</h4>
                    <button type="button" className="btn btn-primary btn-sm mb-2 ms-3" onClick={() => openModal('new')}>+</button> {/* Agregar un select or something para que me lleve a los alqs anteriores*/}
                </div>
                {lastRent &&
                    <div>
                        <table className="custom-fix-table border">
                            <tbody>
                                <tr>
                                    <th>Fecha Inicio</th>
                                    <td>{spanishDate(lastRent.date_from)}</td>
                                </tr>
                                <tr>
                                    <th>Fecha Fin</th>
                                    <td>{spanishDate(lastRent.date_to)}</td>
                                </tr>
                                <tr>
                                    <th>Actualización</th>
                                    <td>{lastRent.actualization}</td>
                                </tr>
                                <tr>
                                    <th>Inquilino/s</th>
                                    <td style={{ whiteSpace: 'pre-line' }}>{tenants}</td>
                                </tr>
                                <tr>
                                    <th>Administra</th>
                                    <td>{lastRent.administrator}</td>
                                </tr>
                                <tr>
                                    <th>Observaciones</th>
                                    <td>{lastRent.observations}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button className="btn btn-secondary btn-sm w-100" onClick={() => handleEdit(lastRent)}><i className="bi bi-pencil-square me-3"></i>Editar Alquiler</button>
                    </div>
                }
            </div>
            {lastRent &&
                <div className='ms-5' style={{ width: "60%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "60%" }}>
                    <DataProvider modelName='escalon' modelDepth='0' relatedModel='escalon' relatedModelDepth='0' relatedFieldName='rent' modelId={lastRent.id}>
                        <RentSteps obj_id={lastRent.id} />
                    </DataProvider>
                </div>
            }
        </div>
    )
}


function RealEstate() {
    const { modelData, loading } = useDataContext();
    const [reName, setReName] = useState('')
    const [reId, setReId] = useState(null);

    useEffect(() => {
        if (modelData) {
            setReName(modelData.re_name);
            setReId(modelData.id);
        }
    }, [modelData])

    return (
        <>
            <div>
                {loading && <Loading />}
                <h1>{reName}</h1>
                <div className="w-100 mt-5">
                    <div className="hstack w-100">
                        <div style={{ width: "40%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "40%" }}>
                            <h4 className="text-start">DATOS</h4>
                            <ReTable />
                        </div>
                        <div className='ms-5' style={{ width: "60%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "60%" }}>
                            <DataProvider modelName='impuesto' modelDepth='0' relatedModel='impuesto' relatedModelDepth='1' relatedFieldName='real_estate' modelId={reId}>
                                <Taxes obj_id={reId} />
                            </DataProvider>
                        </div>
                    </div>
                    <div className="w-100 mt-3">
                        <DataProvider modelName='alquiler' modelDepth='0' relatedModel='alquiler' relatedModelDepth='1' relatedFieldName='real_estate' modelId={reId}>
                            <Rent obj_id={reId} />
                        </DataProvider>
                    </div>
                    <div className="hstack w-100 mt-3" style={{ alignItems: "flex-start" }}>
                        <div style={{ width: "40%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "40%" }}>
                            {reId &&
                                <BalanceProvider reId={reId} modelName='gasto'>
                                    <Collects />
                                </BalanceProvider>
                            }
                        </div>
                        <div className="ms-5" style={{ width: "60%", minHeight: "300px", overflowX: "auto", overflowY: "auto", maxWidth: "60%" }}>
                            {reId &&
                                <BalanceProvider reId={reId} modelName='cobro'>
                                    <Expenses />
                                </BalanceProvider>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RealEstate;