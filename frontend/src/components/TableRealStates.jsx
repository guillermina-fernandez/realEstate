import { useEffect, useState } from "react";
import { useDataContext } from "../context/DataContext";

function TableRealStates() {
    const { modelData, foundObjs } = useDataContext();
    const [showData, setShowData] = useState([])

    useEffect(() => {
            if (Array.isArray(foundObjs) && foundObjs.length > 0) {
                setShowData(foundObjs)
            } else if (Array.isArray(modelData)) {
                setShowData(modelData);
            } else {
                setShowData([])
            }
        }, [modelData, foundObjs])

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        <th>COD</th>
                        <th>PROPIEDAD</th>
                        <th>TIPO</th>
                        <th>COCHERA</th>
                        <th>PROPIETARIO/S</th>
                        <th>USUFRUCTO</th>
                        <th>OBS</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {showData.map((dataItem) =>
                        <tr key={dataItem.id} className="text-start">
                            <td>{dataItem.id}</td>
                            <td>{dataItem.rs_name}</td>
                            <td>{dataItem.rs_type_name}</td>
                            <td>{dataItem.has_garage}</td>
                            <td>{dataItem.owners}</td>
                            <td>{dataItem.usufructs}</td>
                            <td>{ dataItem.observations}</td>
                            <td style={{ width: "10px" }}>
                                <a href={`/propiedad/${dataItem.id}/`}><button className="btn btn-sm btn-success" type="button"><i className="bi bi-pencil-square"></i></button></a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TableRealStates;
