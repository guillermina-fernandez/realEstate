import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";
import TableAgenda from "../components/TableAgenda";
import Loading from "../components/Loading";


function Agenda() {
    const { showModal, openModal, loading } = useDataContext();
    
    return (
        <div>
            {loading && <Loading/>}
            <button className="btn btn-primary w-auto text-nowrap ms-3 mb-5" type="button" onClick={() => openModal('new')}>
                {'+ COBRO/PAGO/PENDIENTE'}
            </button>
            <TableAgenda />
            {showModal && <Modal />}
        </div>
    )
}

export default Agenda;