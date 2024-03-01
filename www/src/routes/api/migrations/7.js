exports.up = function() {
    return `
        -- set new stats to 0
        UPDATE Items
        SET Meleecritperc = 0,
            Meleecrit = 0,
            Meleedamcap = 0,
            Damageshield = 0
        WHERE Meleecritperc IS NULL OR Meleecrit IS NULL OR Meleedamcap IS NULL OR Damageshield IS NULL;
    `;
}

exports.down = function() {
    return `
        -- set new stats to 0
        UPDATE Items
        SET Meleecritperc = NULL,
            Meleecrit = NULL,
            Meleedamcap = NULL,
            Damageshield = NULL
        WHERE Meleecritperc = 0 OR Meleecrit = 0 OR Meleedamcap = 0 OR Damageshield = 0;
    `;
}
