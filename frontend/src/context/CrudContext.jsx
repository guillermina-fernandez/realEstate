import { createContext, useState, useContext, useEffect } from "react";
import { fetchModelObjectsAPI, createObjDataAPI, updateObjDataAPI, deleteObjAPI } from "../services/api_crud";

const modelConfig = {
    propietario: {
        columns: ["COD", "APELLIDO", "NOMBRE", "CUIT"],
        searchBy: ["last_name", "first_name", "cuit"],
        sortBy: ["last_name", "first_name"]
    },
    inquilino: {
        columns: ["COD", "APELLIDO", "NOMBRE", "CUIT"],
        searchBy: ["last_name", "first_name", "cuit"],
        sortBy: ["last_name", "first_name"],
    },
    tipo_de_propiedad: {
        columns: ["COD", "TIPO DE PROPIEDAD"],
        searchBy: ["rs_type"],
        sortBy: ["rs_type"],
    },
    propiedad: {
        columns: ["COD", "PROPIEDAD", "TIPO", "COCHERA", "PROPIETARIO/S", "USUFRUCTO", "OBS"],
        searchBy: ["rs_name", "owners", "usufructs"],
        sortBy: ["rs_name"],
    },
    tipo_de_impuesto: {
        columns: ["COD", 'TIPO DE IMPUESTO'],
        searchBy: ["tax_type"],
        sortBy: ["tax_type"]
    },
    impuesto: {
        columns: ["IMPUESTO", 'NRO', 'NRO SEC', 'TITULAR', 'OBS'],
        searchBy: [''],
        sortBy: ['tax_type', 'tax_other', 'tax_nbr1', 'tax_nbr2']
    }
}

const ObjContext = createContext();

export const useObjContext = () => useContext(ObjContext);

export const ObjProvider = ({ obj, depth, children }) => {
    const [objData, setObjData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchObj, setSearchObj] = useState("");
    const [foundObjs, setFoundObjs] = useState(objData);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [editObj, setEditObj] = useState(null);

    // Load initial data on page load
    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedData = await fetchModelObjectsAPI(obj, depth);
                const flatData = Array.isArray(fetchedData) ? fetchedData.flat() : [];
                setObjData(flatData);
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();

        return () => { }
        
    }, [obj]);
   
    // Alert error (if any)
    useEffect(() => {
        if (error) {
            alert(error);
        }
    }, [error]);

    // Render loading .gif or something
    useEffect(() => {
        if (loading) {
            console.log('Show loading.gif');
        } else {
            console.log('Hide loading.gif');
        }
    }, [loading])

    // Search object:
    useEffect(() => {
        if (!searchObj) {
            setFoundObjs(objData);
            return;
        }

        const lower = searchObj.toLowerCase();
        const { searchBy } = modelConfig[obj] || { searchBy: [] };
        const results = objData.filter((item) =>
            searchBy.some(
                (field) => item[field]?.toString().toLowerCase().includes(lower)
            )
        );

        setFoundObjs(results);
    }, [searchObj, objData])

    const handleSearch = (inputValue) => {
        setSearchObj(inputValue);
    }

    // Handle modal:
    const openModal = (newModalTitle) => {
        setShowModal(true);
        setModalTitle(newModalTitle)
        setEditObj(null);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setEditObj(null);
    };

    // Delete obj:
    const handleDelete = async (obj_id) => {        
        const objToDelete = objData.find(delObj => delObj.id === obj_id);
        let message = 'ATENCIÓN!\nSe eliminará el registro:\n';
        Object.values(objToDelete).forEach(value => {
            message += value + ' - ';
        })
        
        const accepted = confirm(message.slice(0, -3));
        
        if (accepted) {
            setLoading(true);
            try {
                await deleteObjAPI(obj, obj_id);
                setObjData(prev => prev.filter(delObj => delObj.id !== obj_id));
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Submit form:
    const submitForm = async (data, mode) => {
        setLoading(true);
        setError(null);
        try {
            let responseData;
            if (mode === 'create') {
                responseData = await createObjDataAPI(obj, data);
            } else {
                responseData = await updateObjDataAPI(obj, data.id, data);
            }

            const newData = Array.isArray(responseData) ? responseData[0] : responseData;

            if (mode === 'create') {
                addObjData(newData);
            } else {
                updateObjData(newData);
            }
            setShowModal(false);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Update objData with new record:
    const addObjData = (newData) => {
        setObjData(prev => {
            const updated = [...prev, newData];
            return sortData(updated);
        });
    }

    // Update objData with edited record:
    const updateObjData = (newData) => {
        setObjData(prev => {
            const updated = prev.map(item =>
                item.id === newData.id ? newData : item
            ); 
            return sortData(updated);
        });
    }

    const sortData = (data) => {
    const sortByFields = modelConfig[obj]?.sortBy || [];
    if (!sortByFields.length) return data;
        return [...data].sort((a, b) => {
            for (const field of sortByFields) {
                const aVal = a?.[field] ?? "";
                const bVal = b?.[field] ?? "";
                const compare = aVal.toString().localeCompare(bVal.toString());
                if (compare !== 0) return compare;
            }
            return 0;
        });
    };


    // Context values passed to children
    const value = {
        obj,
        objData,
        modelConfig,
        updateObjData,
        setLoading,
        setError,
        showModal, 
        openModal,
        modalTitle,
        closeModal,
        editObj,
        setEditObj,
        submitForm,
        searchObj,
        handleSearch,
        foundObjs,
        handleDelete
    }

    return <ObjContext.Provider value={value}>
        {children}
    </ObjContext.Provider>;
}

