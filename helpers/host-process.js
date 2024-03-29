const express = 
    require('express');
const cors = 
    require('cors');
const config = 
    require('../config.json');
const {
    logError,
    logInfo
} = require('./log-service')

try
{   
    const application = 
        express();
    const port = 
        config.Port

    application
        .listen(port);
    application
        .use(cors({ 
            credentials: true, 
            origin: '*' 
        }))

    logInfo({
        type: "host-start",
        port
    })

} catch(error) {
    console.log("\nHOST ERROR...\n")
    console.log(error)
    logError(error);
}


