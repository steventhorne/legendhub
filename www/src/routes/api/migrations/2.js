exports.up = function() {
    return `
        -- Update SortNumber to be more reasonable for all ItemStatInfos
        UPDATE ItemStatInfo
        SET SortNumber = 200 + SortNumber - 5
        WHERE CategoryId = 2;

        UPDATE ItemStatInfo
        SET SortNumber = 300 + SortNumber - 19
        WHERE CategoryId = 3;

        UPDATE ItemStatInfo
        SET SortNumber = 400 + SortNumber - 25
        WHERE CategoryId = 4;

        UPDATE ItemStatInfo
        SET SortNumber = 500 + SortNumber - 27
        WHERE CategoryId = 5;

        UPDATE ItemStatInfo
        SET SortNumber = 600 + SortNumber - 31
        WHERE CategoryId = 6;

        UPDATE ItemStatInfo
        SET SortNumber = 700 + SortNumber - 33
        WHERE CategoryId = 7;

        UPDATE ItemStatInfo
        SET SortNumber = 800 + SortNumber - 36
        WHERE CategoryId = 8;

        UPDATE ItemStatInfo
        SET SortNumber = 900 + SortNumber - 12
        WHERE CategoryId = 9;

        UPDATE ItemStatInfo
        SET SortNumber = 100 + SortNumber - 1
        WHERE CategoryId = 1 AND SortNumber < 5;

        UPDATE ItemStatInfo
        SET SortNumber = 104
        WHERE Id = 12;

        UPDATE ItemStatInfo
        SET SortNumber = 100 + SortNumber - 40
        WHERE CategoryId = 1 AND SortNumber >= 45 AND SortNumber <= 54;
    `;
}

exports.down = function() {
    return `
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 200 + 5
        WHERE CategoryId = 2;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 300 + 19
        WHERE CategoryId = 3;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 400 + 25
        WHERE CategoryId = 4;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 500 + 27
        WHERE CategoryId = 5;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 600 + 31
        WHERE CategoryId = 6;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 700 + 33
        WHERE CategoryId = 7;
        
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 800 + 36
        WHERE CategoryId = 8;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 900 + 12
        WHERE CategoryId = 9;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 100 + 1
        WHERE CategoryId = 1 AND SortNumber < 104;

        UPDATE ItemStatInfo
        SET SortNumber = 18
        WHERE Id = 12;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 100 + 40
        WHERE CategoryId = 1 AND SortNumber >= 105 AND SortNumber <= 114;
    `;
}
