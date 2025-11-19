import { createContext, useState, useContext, useEffect } from "react";
import { fetchBalanceDataAPI, createObjDataAPI, updateObjDataAPI, deleteObjAPI } from "../services/api_crud";


const BalanceContext = createContext();

export const useBalanceContext = () => useContext(BalanceContext);

export const BalanceProvider = ({ reId, children }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grandTotal, setGrandTotal] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [collects, setCollects] = useState([]);
    const [totalCollects, setTotalCollects] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [editObj, setEditObj] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const fetchedData = await fetchBalanceDataAPI(reId);
                if (cancelled) return;

                setGrandTotal(fetchedData.balance);
                setExpenses(fetchedData.expenses.monthly_data);
                setTotalExpenses(fetchedData.expenses.grand_total);
                setCollects(fetchedData.collects.monthly_data);
                setTotalCollects(fetchedData.collects.grand_total);
            } catch (err) {
                if (!cancelled) setError(err);
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [reId, reloadKey]);

    const reloadData = () => setReloadKey(prev => prev + 1);

    useEffect(() => {
        if (error) alert(error);
    }, [error]);

    /*useEffect(() => {
        console.log(loading ? 'Show loading.gif' : 'Hide loading.gif');
    }, [loading]);*/

    const openModal = (modelName, action) => {
        const noun = modelName === 'gasto' ? 'Gasto' : 'Cobro';
        setModalTitle(`${action === 'new' ? 'Agregar' : 'Editar'} ${noun}`);
        setShowModal(true);
        setEditObj(null);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditObj(null);
    };

    const handleDelete = async (modelName, deleteId) => {
        const objToDelete = modelName === 'gasto'
            ? expenses.flatMap(m => m.expenses).find(e => e.id === deleteId)
            : collects.flatMap(m => m.collects).find(e => e.id === deleteId);
        
        if (!objToDelete) return;

        let message = 'ATENCIÓN!\nSe eliminará el siguiente registro y todas sus dependencias:\n';
        message += Object.values(objToDelete).join(' - ');

        if (!confirm(message)) return;

        setLoading(true);

        try {
            await deleteObjAPI(modelName, deleteId);
            reloadData();
            closeModal();
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const submitForm = async (modelName, submitData, submitMode) => {
        setLoading(true);
        setError(null);

        try {
            if (submitMode === 'create') {
                await createObjDataAPI(modelName, submitData, '0');
            } else {
                await updateObjDataAPI(modelName, submitData.id, submitData, '0');
            }
            reloadData();
            closeModal();
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Context values passed to children
    const value = {
        reId,
        setLoading,
        loading,
        setError,
        grandTotal,
        expenses,
        totalExpenses,
        collects,
        totalCollects,
        showModal,
        openModal,
        closeModal,
        modalTitle,
        setEditObj,
        editObj,
        handleDelete,
        submitForm
    }

    return <BalanceContext.Provider value={value}>
        {children}
    </BalanceContext.Provider>;
}

