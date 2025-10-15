import { useState, useEffect, useRef } from 'react';
import { useDataContext } from '../context/DataContext';
import {FormOwner, FormRealEstate, FormReType, FormTax, FormTaxType, FormRent, FormRentStep} from './CrudForms';


function Modal(props) {
    const { modelName, closeModal, editObj, modalTitle, handleDelete } = useDataContext();
    const [disable, setDisable] = useState(true);
    const editFromModal = ['propiedad']

    useEffect(() => {
        modelName && editFromModal.includes(modelName) && setDisable(false);
    }, [modelName])
    
    const formRef = useRef(null);

    function handleClick() {
        if (formRef.current) {
            formRef.current.requestSubmit();
        }
    }
    
    return (
        <div className="modal fade show d-block pg-show-modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog" role="document">
                <div className="modal-content px-3 py-3">
                    <div className="modal-header">
                        <h4 className="modal-title">{modalTitle}</h4>
                        <button className="btn-close" type="button" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        {modelName === 'propietario' && <FormOwner formRef={formRef} initialData={editObj}></FormOwner>}
                        {modelName === 'inquilino' && <FormOwner formRef={formRef} initialData={editObj}></FormOwner>}
                        {modelName === "tipo_de_propiedad" && <FormReType formRef={formRef} initialData={editObj}></FormReType>}
                        {modelName === 'tipo_de_impuesto' && <FormTaxType formRef={formRef} initialData={editObj}></FormTaxType>}
                        {modelName === 'propiedad' && <FormRealEstate formRef={formRef} initialData={editObj}></FormRealEstate>}
                        {modelName === "impuesto" && <FormTax formRef={formRef} initialData={editObj} obj_id={props.obj_id}></FormTax>}
                        {modelName === 'alquiler' && <FormRent formRef={formRef} initialData={editObj} obj_id={props.obj_id}></FormRent>}
                        {modelName === 'escalon' && <FormRentStep formRef={formRef} initialData={editObj} obj_id={props.obj_id}></FormRentStep>}
                    </div>
                    <hr/>
                    <div className="hstack w-100 justify-content-between">
                        <div>
                            <button className="btn btn-danger" onClick={() => handleDelete(parseInt(props.obj_id))} disabled={disable} hidden={disable}>Eliminar</button>
                        </div>
                        <div className="hstack gap-3">
                            <button className="btn btn-default" type="button" onClick={closeModal}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleClick}>Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;