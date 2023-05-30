exports.up = function() {
    return `
        -- Update SortNumber to split up category 1 again
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber + 995
        WHERE SortNumber >= 5 AND SortNumber <= 14
    `;
}

exports.down = function() {
    return `
        -- Update SortNumber to merge category 1 again
        UPDATE ItemStatInfo
        SET SortNumber = SortNumber - 995
        WHERE SortNumber >= 1000 AND SortNumber <= 1009
    `;
}
