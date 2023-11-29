interface RumApi {
    getInternalContext(): {
        session_id?: string;
        view?: {
            id?: string;
            name?: string;
        };
    };
}
export declare function getRum(): RumApi | undefined;
export {};
