import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import TableRealStates from "../components/TableRealStates";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";


function Crud() {
    const { modelName, modelConfig, showModal } = useDataContext();

    return (
        <div>
            <SearchBar />
            {modelName == 'propiedad' ? <TableRealStates /> : <Table cols={modelConfig[modelName]["columns"]} />}
            {showModal && <Modal />}
        </div>
    )
}

export default Crud;