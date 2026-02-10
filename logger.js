function Logger(){
    function error(message){
        const now = new Date().toISOString();
        console.log(`[${now}] [ERROR] ${message}`);
    }

    function info(message){
        const now = new Date().toISOString();
        console.log(`[${now}] [INFO] ${message}`);
    }

    return { error, info };
}

export { Logger };