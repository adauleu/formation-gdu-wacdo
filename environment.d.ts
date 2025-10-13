declare global {
    namespace NodeJS {
        interface ProcessEnv {
            JWT_SECRET: string;
            DB_USER: string;
            DB_PASSWORD: string;
            PORT: number;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { }