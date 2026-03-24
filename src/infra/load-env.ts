export function loadEnv(key: string): string {
    const value = process.env[key];
    if (!value){
        console.log(`env var ${key} not found.`);
        process.exit(1);
    }
    return value;
}