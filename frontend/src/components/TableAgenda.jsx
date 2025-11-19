import { useEffect, useState } from "react";
import { useDataContext } from "../context/DataContext";
import { spanishDate } from "../myScripts/myMainScript";

function TableAgenda() {
    const { modelData, handleDelete, setEditObj, openModal } = useDataContext();
    const [showData, setShowData] = useState([])

    useEffect(() => {
        if (Array.isArray(modelData)) {
            setShowData(modelData);
        } else {
            setShowData([])
        }
    }, [modelData])

    const handleEdit = (editObj) => {
        openModal('edit');
        const newObj = {
            id: editObj.id,
            action: editObj.action,
            action_detail: editObj.action_detail,
            agenda_date: editObj.agenda_date,
            agenda_value: editObj.agenda_value,
            detail: editObj.detail,
            observations: editObj.observations,
            real_estate: editObj.real_estate?.id || null,
            tax: editObj.tax?.id || null,
        }
        setEditObj(newObj)
    }

    function getDetail(agendaItem) {
        if (agendaItem.action_detail === 'IMPUESTO') {
            let tax_name = '';

            if (agendaItem.tax) {
                const taxObj = agendaItem.tax;
                const taxType = taxObj.tax_type.tax_type === 'OTRO' ? taxObj.tax_other : taxObj.tax_type.tax_type;
                const taxNbr1 = taxObj.tax_nbr1;
                const taxNbr2 = taxObj.tax_nbr2 || null;

                tax_name += taxType
                tax_name += ` (${taxNbr1}`;
                if (taxNbr2) {
                    tax_name += ` / ${taxNbr2}`;
                }
                tax_name += ')';
            }
            return tax_name;
        }
        if (agendaItem.action_detail === 'ALQUILER') return agendaItem.action_detail;
        return agendaItem.detail;
    }

    function getExpiration(dateString) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const date_parts = dateString.split('-');
        const year = parseInt(date_parts[0]);
        const month = parseInt(date_parts[1]) - 1;
        const day = parseInt(date_parts[2]);

        const expiration_date = new Date(year, month, day);
        expiration_date.setHours(0, 0, 0, 0);

        const diff_time = expiration_date.getTime() - today.getTime();
        const diff_days = Math.round(diff_time / (1000 * 60 * 60 * 24));

        if (diff_days < 0) {
            return 'bg-danger-due';
        } else if (diff_days === 0) {
            return 'bg-danger-today';
        } else if (diff_days > 0 && diff_days < 5) {
            return 'bg-danger-soon';
        }
        return '';
    }

    function handleProcess(agendaObj) {
        const agendaId = agendaObj.id;
        let accepted = null;
        if (agendaObj.action === 'PAGAR' && agendaObj.real_estate) {
            accepted = confirm('ATENCIÓN!\nEl pago se registrará como gasto y será eliminado de esta agenda.\nEn caso de no desearlo, cancelar y eliminar manualmente.');
        } else if (agendaObj.action === 'COBRAR' && agendaObj.real_estate) {
            accepted = confirm('ATENCIÓN!\nEl cobro se registrará como ingreso y será eliminado de esta agenda.\nEn caso de no desearlo, cancelar y eliminar manualmente.');
        } else {
            alert('Opción deshabilitada para este registro. Elimine o Modifique manualmente desde las otras opciones.');
        }
        if (accepted) {
            const processAgenda = async () => {
                const response = await fetch(`http://127.0.0.1:8000/api/agenda/cod/${agendaId}/`);
                if (!response.ok) {
                    let result;
                    try {
                        result = await response.json();
                    } catch {
                        result = await response.json();
                    }

                    const message = result?.error ? JSON.stringify(result.error, null, 2) : `Error ${response.status}`;
                    throw new Error(message);
                } else {
                    setShowData(prev =>
                        prev.filter(item => item !== agendaObj)
                    );
                }
            };

            processAgenda();
        }
    }

    return (
        <div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>FECHA</th>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>ACCION</th>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>IMPORTE</th>
                        <th>DETALLE</th>
                        <th>PROPIEDAD</th>
                        <th>OBS</th>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {showData.map((dataItem) =>
                        <tr key={dataItem.id} className="text-start">
                            <td
                                className={`fw-bold ${dataItem?.agenda_date && getExpiration(dataItem.agenda_date)}`}
                                style={{ width: "1%", whiteSpace: "nowrap" }}
                            >{spanishDate(dataItem.agenda_date)}</td>
                            <td className="fw-bold" style={{ width: "1%", whiteSpace: "nowrap" }}>{dataItem.action !== 'OTRO' && dataItem.action}</td>
                            <td className="fw-bold text-end" style={{ width: "1%", whiteSpace: "nowrap" }}>{dataItem.agenda_value && parseFloat(dataItem.agenda_value).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                            <td className="fw-bold">{getDetail(dataItem)}</td>
                            <td>{dataItem.re_name}</td>
                            <td>{dataItem.observations}</td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(dataItem.id)}><i className="bi bi-trash3"></i></button>
                            </td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(dataItem)}><i className="bi bi-pencil-square"></i></button>
                            </td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm" type="button" style={{ backgroundColor: "#91ff00ff" }} onClick={() => handleProcess(dataItem)}><i className="bi bi-check-square"></i></button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TableAgenda;