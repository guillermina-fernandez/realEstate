import { useState, useEffect } from "react";


function TableChecks({ objs, onSelectionChange, initialData}) {
    const [itemsChecked, setItemsChecked] = useState([]);

    useEffect(() => {
        const items = Array.isArray(initialData) ? initialData.map(Number) : [];
        setItemsChecked([...new Set(items)]);
    }, [initialData]);

    useEffect(() => {
        onSelectionChange(itemsChecked);
    }, [itemsChecked, onSelectionChange])

    const handleClick = (item) => {
        const int_item = Number(item);
        setItemsChecked((prev) => {
        if (prev.includes(int_item)) {
            return prev.filter((id) => id !== int_item);
        } else {
            return [...prev, int_item];
        }
        });
    };
    
    return (
        <div className="w-100 border border-secondary p-2" style={{ height: '150px', overflowY: 'scroll', display: 'block' }}>
            <table className="custom-table mt-3">
                <tbody>
                    {objs && objs.map(item => (
                        <tr key={item.id}>
                            <td><input type="checkbox" value={item.id} checked={itemsChecked.includes(Number(item.id))} onChange={() => {handleClick(item.id)}} /></td>
                            <td>{item.id}</td>
                            <td className="text-start">{item.last_name} {item.first_name} ({item.cuit})</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


export default TableChecks;