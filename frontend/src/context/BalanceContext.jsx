import { createContext, useState, useContext, useEffect } from "react";
import { fetchBalanceDataAPI, createObjDataAPI, updateObjDataAPI, deleteObjAPI } from "../services/api_crud";


const BalanceContext = createContext();

export const useBalanceContext = () => useContext(BalanceContext);

export const BalanceProvider = ({ reId, children }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grandTotal, setGrandTotal] = useState(0)
    const [expenses, setExpenses] = useState(null);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [collects, setCollects] = useState(null);
    const [totalCollects, setTotalCollects] = useState(0);
    

    // Load initial data on page load
    useEffect(() => {
        const loadData = async () => {
            try {
                const fetchedData = await fetchBalanceDataAPI(reId)
                setGrandTotal(fetchedData['balance'])
                setExpenses(fetchedData['expenses']['monthly_data'])
                setTotalExpenses(fetchedData['expenses']['grand_total'])
                setCollects(fetchedData['collects']['monthly_data'])
                setTotalCollects(fetchedData['collects']['grand_total'])
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();

        return () => { }
        
    }, [reId]);

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

    console.log(grandTotal)
    console.log(expenses)
    console.log(collects)
    
    /*
    // Handle modal:
    const openModal = (modelName, action) => {        
        let titleStr = action == 'new' ? 'Agregar ' : 'Editar ';
        if (modelName == 'gasto') {
            titleStr += 'Gasto'
        } else if (modelName == 'cobro') {
            titleStr += 'Cobro'
        }
        setModalTitle(titleStr)
        setShowModal(true);
        setEditObj(null);
    };
    
    const closeModal = () => {
        setShowModal(false);
        setEditObj(null);
    };

    // Delete obj:
    const handleDelete = async (deleteId) => {        
        const objToDelete = modelData.find(deleteObj => deleteObj.id === deleteId);
        
        if (!objToDelete) return
        let message = 'ATENCIÓN!\nSe eliminará el siguiente registro y todas sus dependencias:\n';
        Object.values(objToDelete).forEach(value => {
            message += value + ' - ';
        })
        
        const accepted = confirm(message.slice(0, -3));
        
        if (accepted) {
            setLoading(true);
            try {
                await deleteObjAPI(modelName, deleteId);
                setModelData(prev => prev.filter(deleteObj => deleteObj.id !== deleteId));
                closeModal();
                const basePath = `/${modelName}/`;
                navigate(basePath)
            } catch (err) {
                setError(err);
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Submit form:
    const submitForm = async (submitData, submitMode) => {
        setLoading(true);
        setError(null);
        try {
            let responseData;
            if (submitMode === 'create') {
                responseData = await createObjDataAPI(modelName, submitData, modelDepth);
            } else {
                responseData = await updateObjDataAPI(modelName, submitData.id, submitData, modelDepth)
            }

            const newData = Array.isArray(responseData) ? responseData[0] : responseData;

            if (submitMode === 'create') {
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
        setModelData(prev => {
            const updated = [...prev, newData];
            return sortData(updated);
        });
    }

    // Update objData with edited record:
    const updateObjData = (newData) => {
        if (Array.isArray(modelData)) {
            setModelData(prev => {
                const updated = prev.map(item =>
                    item.id === newData.id ? newData : item
                ); 
                return sortData(updated);
            });    
        } else {
            setModelData(newData);
        }
    }

    const sortData = (sortedData) => {
    const sortByFields = modelConfig[modelName]?.sortBy || [];
    if (!sortByFields.length) return sortedData;
        return [...sortedData].sort((a, b) => {
            for (const field of sortByFields) {
                const aVal = a?.[field] ?? "";
                const bVal = b?.[field] ?? "";
                const compare = aVal.toString().localeCompare(bVal.toString());
                if (compare !== 0) return compare;
            }
            return 0;
        });
    };*/


    // Context values passed to children
    const value = {
        /*modelName,
        modelData,
        modelConfig,
        setLoading,
        setError,
        showModal, 
        openModal,
        modalTitle,
        objName,
        closeModal,
        editObj,
        setEditObj,
        submitForm,
        handleDelete*/
        reId,
        grandTotal,
        expenses,
        totalExpenses,
        collects,
        totalCollects
    }

    return <BalanceContext.Provider value={value}>
        {children}
    </BalanceContext.Provider>;
}

