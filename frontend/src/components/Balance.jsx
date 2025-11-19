import React, { useEffect, useState } from "react";
import { useBalanceContext } from "../context/BalanceContext";
import { spanishDate } from "../myScripts/myMainScript";
import { useRef } from "react";
import { FormExpense, FormCollect } from "./CrudForms";
import Loading from "./Loading";


function ModalBalance(props) {
    const { closeModal, editObj, modalTitle, loading } = useBalanceContext();

    const formRef = useRef(null);

    function handleClick() {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    }

    return (
        <>
            {loading && <Loading />}
            <div className="modal fade show d-block pg-show-modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
                <div className="modal-dialog" role="document">
                    <div className="modal-content px-3 py-3">
                        <div className="modal-header">
                            <h4 className="modal-title">{modalTitle}</h4>
                            <button className="btn-close" type="button" onClick={closeModal}></button>
                        </div>
                        <div className="modal-body">
                            {props.modelName === 'gasto' ?
                                <FormExpense formRef={formRef} initialData={editObj} obj_id={props.obj_id}></FormExpense> :
                                <FormCollect formRef={formRef} initialData={editObj} obj_id={props.obj_id}></FormCollect>}
                        </div>
                        <hr />
                        <div className="hstack w-100 justify-content-between">
                            <div>

                            </div>
                            <div className="hstack gap-3">
                                <button className="btn btn-default" type="button" onClick={closeModal}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleClick}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}



function getExpenseLabel(exp) {
    if (exp.expense_type === 'OTRO') {
        return exp.other_expense || '-';
    } else if (exp.tax) {
        if (exp.tax.tax_type.tax_type == 'OTRO') {
            return exp.tax.tax_other || '-';
        } else {
            return exp.tax.tax_type.tax_type || '-';
        }
    }
}

function Expenses() {
    const { reId, expenses, totalExpenses, openModal, showModal, setEditObj, handleDelete } = useBalanceContext();

    const handleEdit = (editObj) => {
        openModal('gasto', 'edit');
        setEditObj(editObj)
    }

    return (
        <>
            {showModal && reId && (<ModalBalance modelName='gasto' obj_id={reId} />)}
            <div className="hstack">
                <h4>GASTOS</h4>
                <button type="button" className="btn btn-primary btn-sm mb-2 ms-3" onClick={() => openModal('gasto', 'new')}>+</button>
            </div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>FECHA</th>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>IMPORTE</th>
                        <th className="text-center">TIPO</th>
                        <th className="text-center">DETALLE</th>
                        <th className="text-center">OBS</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                {expenses && expenses.length > 0 && (
                    <tbody>
                        {expenses.map((monthData) => (
                            <React.Fragment key={monthData.month}>
                                {monthData.expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td style={{ width: "1%", whiteSpace: "nowrap" }}>{spanishDate(exp.pay_date)}</td>
                                        <td className="text-end" style={{ width: "1%", whiteSpace: "nowrap" }}>{parseFloat(exp.pay_value).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                                        <td className="text-center">{exp.expense_type}</td>
                                        <td className="text-center">{getExpenseLabel(exp)}</td>
                                        <td className="text-center">{exp.observations}</td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete('gasto', exp.id)}><i className="bi bi-trash3"></i></button>
                                        </td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(exp)}><i className="bi bi-pencil-square"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="fw-bold" style={{ backgroundColor: "#E6F07A" }}>
                                    <td>Total {monthData.month}:</td>
                                    <td className="text-end">{parseFloat(monthData.total).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                                    <td colSpan={5}></td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                )}
                {totalExpenses !== null && totalExpenses !== undefined && (
                    <tfoot>
                        <tr>
                            <td colSpan={3} style={{ height: "10px", border: "none" }}></td>
                        </tr>
                        <tr className="fw-bold" style={{ backgroundColor: "#F0FF6E" }}>
                            <td>TOTAL HISTORICO</td>
                            <td className="text-end">{parseFloat(totalExpenses).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                            <td colSpan={5}></td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </>
    );
}


function Collects() {
    const { reId, setLoading, setError, collects, totalCollects, openModal, showModal, setEditObj, handleDelete, grandTotal } = useBalanceContext();
    const [totalColor, setTotalColor] = useState('#8fbafaff')

    useEffect(() => {
        grandTotal && grandTotal < 0 ? setTotalColor('#FFBA8F') : setTotalColor('#8fbafaff');
    }, [grandTotal])

    const handleEdit = (editObj) => {
        openModal('cobro', 'edit');
        setEditObj(editObj)
    }

    return (
        <>
            {showModal && reId && (<ModalBalance modelName='cobro' obj_id={reId} />)}
            <div className="hstack">
                <h4>COBROS</h4>
                <button type="button" className="btn btn-primary btn-sm mb-2 ms-3" onClick={() => openModal('cobro', 'new')}>+</button>
            </div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>FECHA</th>
                        <th style={{ width: "1%", whiteSpace: "nowrap" }}>IMPORTE</th>
                        <th className="text-center">TIPO</th>
                        <th className="text-center">DETALLE</th>
                        <th className="text-center">OBS</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                {collects && collects.length > 0 && (
                    <tbody>
                        {collects.map((monthData) => (
                            <React.Fragment key={monthData.month}>
                                {monthData.collects.map((col) => (
                                    <tr key={col.id}>
                                        <td style={{ width: "1%", whiteSpace: "nowrap" }}>{spanishDate(col.col_date)}</td>
                                        <td className="text-end" style={{ width: "1%", whiteSpace: "nowrap" }}>{parseFloat(col.col_value).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                                        <td className="text-center">{col.col_type}</td>
                                        <td className="text-center">{col.col_type == 'OTRO' && col.col_other}</td>
                                        <td className="text-center">{col.observations}</td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete('cobro', col.id)}><i className="bi bi-trash3"></i></button>
                                        </td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-success" type="button" onClick={() => handleEdit(col)}><i className="bi bi-pencil-square"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="fw-bold" style={{ backgroundColor: "#E6F07A" }}>
                                    <td>Total {monthData.month}:</td>
                                    <td className="text-end">{parseFloat(monthData.total).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                                    <td colSpan={5}></td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                )}
                {totalCollects !== null && totalCollects !== undefined && (
                    <tfoot>
                        <tr>
                            <td colSpan={3} style={{ height: "10px", border: "none" }}></td>
                        </tr>
                        <tr className="fw-bold" style={{ backgroundColor: "#F0FF6E" }}>
                            <td>TOTAL HISTORICO</td>
                            <td className="text-end">{parseFloat(totalCollects).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                            <td colSpan={5}></td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ height: "20px", border: "none" }}></td>
                        </tr>
                        <tr className="fw-bold" style={{ backgroundColor: totalColor }}>
                            <td colSpan={7} className="text-center">BALANCE HISTORICO (COBROS - GASTOS): {parseFloat(grandTotal).toLocaleString('es-ES', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}</td>
                        </tr>
                    </tfoot>
                )}
            </table>

        </>
    );
}


export { Expenses, Collects }