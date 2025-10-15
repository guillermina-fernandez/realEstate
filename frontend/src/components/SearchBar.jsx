import { useDataContext } from "../context/DataContext";

function SearchBar() {
    const { objName, searchObj, handleSearch, openModal } = useDataContext();
    //const obj_name = modelName.toUpperCase().replaceAll('_', ' ');
    //const obj_name_title = String(modelName[0]).toUpperCase() + String(modelName).slice(1);
    //const newModalTitle = `Agregar ${obj_name_title.replaceAll('_', ' ')}`
    //const placeholder = `Buscar ${obj_name_title.replaceAll('_', ' ')}...`
    const obj_name_title = objName.toUpperCase();
    const placeholder = `Buscar ${objName}...`;

    return (
        <div className="hstack w-100 mb-5">
            <input className="form-control w-100" type="text" placeholder={ placeholder } value={searchObj} onChange={(e) => handleSearch(e.target.value)}/>
            <button className="btn btn-primary w-auto text-nowrap ms-3" type="button" onClick={() => openModal('new')}>
                {`+ ${obj_name_title}`}
            </button>
        </div>
    );
}

export default SearchBar;