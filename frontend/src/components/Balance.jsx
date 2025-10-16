import React from "react";
import { useBalanceContext } from "../context/BalanceContext";
import { spanishDate } from "../myScripts/myMainScript";


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
    const { expenses, totalExpenses } = useBalanceContext();

    return (
        <>
            {/*showModal && <Modal obj_id={obj_id} />*/}
            <div className="hstack">
                <h4>GASTOS</h4>
                <button type="button" className="btn btn-primary btn-sm mb-2 ms-3">+</button>
            </div>
            <table className="custom-table border">
                <thead>
                    <tr>
                        <th>FECHA</th>
                        <th>IMPORTE</th>
                        <th>TIPO</th>
                        <th>GASTO</th>
                        <th>OBS</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                {expenses &&
                    <tbody>
                        {expenses.map((monthData) => (
                            <React.Fragment key={monthData.month}>
                                {monthData.expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td>{spanishDate(exp.pay_date)}</td>
                                        <td className="text-end">{parseFloat(exp.pay_value).toFixed(2)}</td>
                                        <td>{exp.expense_type}</td>
                                        <td>{getExpenseLabel(exp)}</td>
                                        <td>{exp.observations}</td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-danger" type="button"><i className="bi bi-trash3"></i></button>
                                        </td>
                                        <td style={{ width: "10px" }}>
                                            <button className="btn btn-sm btn-success" type="button"><i className="bi bi-pencil-square"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="fw-bold" style={{backgroundColor: "#75ACFF"}}>
                                    <td>Total {monthData.month}:</td>
                                    <td className="text-end">{parseFloat(monthData.total).toFixed(2)}</td>
                                    <td colSpan={5}></td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                }
                <tr>
                    <td colSpan={3} style={{ height: "10px", border: "none" }}></td>
                </tr>
                {totalExpenses &&
                    <tfoot>
                        <tr className="fw-bold" style={{backgroundColor: "#2E82FF"}}>
                            <td>TOTAL HISTORICO</td>
                            <td className="text-end">{parseFloat(totalExpenses).toFixed(2)}</td>
                            <td colSpan={5}></td>
                        </tr>
                    </tfoot>
                }
            </table>
        </>
    );
}


export { Expenses }