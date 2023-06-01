exports.up = function() {
    return `
        -- Update SortNumber to split up category 1 again
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber + 100
        WHERE SortNumber >= 300;

        UPDATE ItemStatInfo
        SET SortNumber = 300
        WHERE Id = 12;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber + 995
        WHERE SortNumber >= 105 AND SortNumber <= 114;
    `;
}

exports.down = function() {
    return `
        -- Update SortNumber to merge category 1 again
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 995
        WHERE SortNumber >= 1100 AND SortNumber <= 1109;

        UPDATE ItemStatInfo
        SET SortNumber = 104
        WHERE Id = 12;

        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 100
        WHERE SortNumber >= 400;
    `;
}
