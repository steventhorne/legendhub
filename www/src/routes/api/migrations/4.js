exports.up = function() {
    return `
        -- Add missing areas
        INSERT INTO Areas (Name, Era, LuciferName, EraId)
        VALUES ('Asgard', 'Ancient', '', 2);
    `;
}

exports.down = function() {
    return `
        DELETE FROM Areas
        WHERE Name IN ('Asgard')
    `;
}
