import { get, getAll, has } from '@vercel/edge-config';

export const getEdgeValue = async <T>(key: string): Promise<T | undefined> => {
    try {
        return await get<T>(key);
    } catch (error) {
        console.error('Edge Config get error:', error);
        return undefined;
    }
};

export const getAllEdgeValues = async <T>(): Promise<T | undefined> => {
    try {
        return await getAll<T>();
    } catch (error) {
        console.error('Edge Config getAll error:', error);
        return undefined;
    }
};

export const hasEdgeKey = async (key: string): Promise<boolean> => {
    try {
        return await has(key);
    } catch (error) {
        console.error('Edge Config has error:', error);
        return false;
    }
};
