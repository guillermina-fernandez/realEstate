import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import TableRealEstates from "../components/TableRealEstates";
import Modal from "../components/Modal";
import { useDataContext } from "../context/DataContext";


function Crud() {
    const { modelName, modelConfig, showModal } = useDataContext();

    return (
        <div>
            <SearchBar />
            {modelName == 'propiedad' ? <TableRealEstates /> : <Table cols={modelConfig[modelName]["columns"]} />}
            {showModal && <Modal />}
        </div>
    )
}

export default Crud;