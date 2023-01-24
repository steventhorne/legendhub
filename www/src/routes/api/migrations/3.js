exports.up = function() {
    return `
        -- Add missing areas
        INSERT INTO Areas (Name, Era, LuciferName, EraId)
        VALUES ('The Nile Valley', 'Industrial', '', 4),
               ('Journey to the Center of the Earth', 'Industrial', '', 4),
               ('The British Museum', 'Industrial', '', 4),
               ('Antebellum Louisiana', 'Industrial', '', 4),
               ('The Stonehenge Barrows', 'Medieval', '', 3),
               ('Hall of Legends', 'Medieval', '', 3),
               ('Ancient Troy', 'Ancient', '', 2),
               ('Normandy Landings', 'Industrial', '', 4);
    `;
}

exports.down = function() {
    return `
        DELETE FROM Areas
        WHERE Name IN ('The Nile Valley', 'Journey to the Center of the Earth', 'The British Museum', 'Antebellum Louisiana', 'The Stonehenge Barrows', 'Hall of Legends', 'Ancient Troy', 'Normandy Landings');
    `;
}
