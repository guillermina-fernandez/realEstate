import { useEffect, useState } from "react";
import { useDataContext } from "../context/DataContext";
import { spanishDate } from "../myScripts/myMainScript";

function TableAgenda() {
    const { modelData } = useDataContext();
    const [showData, setShowData] = useState([])

    useEffect(() => {
        if (Array.isArray(modelData)) {
            setShowData(modelData);
        } else {
            setShowData([])
        }
    }, [modelData])

    function getDetail(agendaItem) {
        if (agendaItem.action_detail === 'IMPUESTO') return agendaItem.tax_name;
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
            return 'bg-warning-subtle';
        }
        return '';
    }

    console.log(showData);

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
                    </tr>
                </thead>
                <tbody>
                    {showData.map((dataItem) =>
                        <tr key={dataItem.id} className="text-start">
                            <td
                                className={`fw-bold ${getExpiration(dataItem.agenda_date)}`}
                                style={{ width: "1%", whiteSpace: "nowrap" }}
                            >{spanishDate(dataItem.agenda_date)}</td>
                            <td className="fw-bold" style={{ width: "1%", whiteSpace: "nowrap" }}>{dataItem.action !== 'OTRO' && dataItem.action}</td>
                            <td className="fw-bold text-end" style={{ width: "1%", whiteSpace: "nowrap" }}>{dataItem.agenda_value && parseFloat(dataItem.agenda_value).toFixed(2)}</td>
                            <td className="fw-bold">{getDetail(dataItem)}</td>
                            <td>{dataItem.re_name}</td>
                            <td>{dataItem.observations}</td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-success" type="button"><i className="bi bi-pencil-square"></i></button>
                            </td>
                            <td>

                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TableAgenda;