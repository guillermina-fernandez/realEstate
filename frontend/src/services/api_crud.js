const API_URL = import.meta.env.VITE_API_URL;


// Fetch all objects from one model
export const fetchModelObjectsAPI = async (modelName, modelDepth) => {
    const response = await fetch(`${API_URL}/api/${modelName}/${modelDepth}/`);

    if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
            const result = await response.json();
            message = result.error || JSON.stringify(result);
        } catch {
            
        }
        throw new Error(message);
    }
    
    return await response.json();
};


// Fetch all objects from a related model
export const fetchRelatedModelObjectsAPI = async (relatedModel, relatedModelDepth, relatedFieldName, modelId) => {
    const response = await fetch(`${API_URL}/api/related/${relatedModel}/${relatedModelDepth}/${relatedFieldName}/${modelId}/`);

    if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
            const result = await response.json();
            message = result.error || JSON.stringify(result);
        } catch {
            
        }
        throw new Error(message);
    }
    
    return await response.json();
};



// Fetch one object from a model
export const fetchObjDataAPI = async (modelName, objId, modelDepth) => {
    const response = await fetch(`${API_URL}/api/${modelName}/cod/${objId}/${modelDepth}/`);
    if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
            const result = await response.json();
            message = result.error || JSON.stringify(result);
        } catch {
            
        }
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    
    return await response.json();
};


// Create new record
export const createObjDataAPI = async (modelName, objData, modelDepth) => {
    const response = await fetch(`${API_URL}/api/create/${modelName}/${modelDepth}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objData)
    });

    const responseBody = await response.text();
    let result;

    try {
        result = JSON.parse(responseBody);
    } catch {
        result = responseBody;
    }

    if (!response.ok) {
        throw new Error(
            result.error
                ? JSON.stringify(result.error, null, 2)
                : `Error ${response.status}`
        );
    }

    return result;
};

// Update record:
export const updateObjDataAPI = async (modelName, objId, objData, modelDepth) => {
    const response = await fetch(`${API_URL}/api/update/${modelName}/${objId}/${modelDepth}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(objData),
    });

    const responseBody = await response.text();
    let result;

    try {
        result = JSON.parse(responseBody);
    } catch {
        result = responseBody;
    }

    if (!response.ok) {
        throw new Error(
            result.error
                ? JSON.stringify(result.error, null, 2)
                : `Error ${response.status}`
        );
    }

    return result;
};

// Delete record:
export const deleteObjAPI = async (modelName, objId) => {
    const response = await fetch(`${API_URL}/api/delete/${modelName}/${objId}/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        let result;
        try {
            result = await response.json();
        } catch {
            result = await response.text();
        }

        const message = result?.error ? JSON.stringify(result.error, null, 2) : `Error ${response.status}`;
        throw new Error(message);
    }
};


// Fetch all objects from expenses or collects
export const fetchBalanceDataAPI = async (reId) => {
    const response = await fetch(`${API_URL}/api/propiedad/${reId}/balance/`);

    if (!response.ok) {
        let message = `Error ${response.status}`;
        try {
            const result = await response.json();
            message = result.error || JSON.stringify(result);
        } catch {
            
        }
        throw new Error(message);
    }
    
    return await response.json();
};

