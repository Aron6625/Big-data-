const tipoVenta = {
    alquiler: (min, max) => ({
        "isAllHomes": {
            "value": true
        },
        "monthlyPayment": {
            "max": max,
            "min": min,
        },
        "isManufactured": {
            "value": false
        },
        "isSingleFamily": {
            "value": false
        },
        "isForRent": {
            "value": true
        },
        "isForSaleByAgent": {
            "value": false
        },
        "isForSaleByOwner": {
            "value": false
        },
        "isNewConstruction": {
            "value": false
        },
        "isComingSoon": {
            "value": false
        },
        "isAuction": {
            "value": false
        },
        "isForSaleForeclosure": {
            "value": false
        }
    }),
    venta: (min, max) => ({
        "isAllHomes": {
            "value": true
        },
        "price": {
            "max": max,
            "min": min,
        },
    })
};

module.exports = tipoVenta;