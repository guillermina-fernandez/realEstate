import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import TableAgenda from "../components/TableAgenda";


function Agenda() {
    const { showModal, openModal } = useDataContext();
    
    return (
        <div>
            <button className="btn btn-primary w-auto text-nowrap ms-3 mb-5" type="button" onClick={() => openModal('new')}>
                {'+ COBRO/PAGO/PENDIENTE'}
            </button>
            <TableAgenda />
            {showModal && <Modal />}
        </div>
    )
}

export default Agenda;