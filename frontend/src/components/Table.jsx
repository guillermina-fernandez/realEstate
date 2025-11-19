import { useEffect, useState } from "react";
import { useDataContext } from "../context/DataContext";

function Table({ cols }) {
    const { modelData, foundObjs, handleDelete, openModal, setEditObj } = useDataContext();
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

    const handleEdit = (editObj) => {
        openModal('edit');
        setEditObj(editObj)
    }

    return (
        <div>
            <table className="table">
                <thead>
                    <tr>
                        {cols.map((col, index) => <th key={`col${index}`} className="text-start">{col}</th>)}
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {showData.map((dataItem) =>
                        <tr key={dataItem.id} className="text-start">
                            {Object.keys(dataItem).map((key, index) => (
                                <td key={index} style={{ verticalAlign: "middle" }}>
                                    {typeof dataItem[key] === "object"
                                        ? JSON.stringify(dataItem[key])
                                        : dataItem[key]}
                                </td>
                            ))}
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(dataItem.id)}><i className="bi bi-trash3"></i></button>
                            </td>
                            <td style={{ width: "10px" }}>
                                <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(dataItem)}><i className="bi bi-pencil-square"></i></button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default Table;
