let express = require("express");
let router = express.Router();
let apiUtils = require("./api/utils");

router.get(["/", "/index.html"], async function(req, res, next) {
    let query = `
    {
        getItemStatCategories {
            name
            getItemStatInfo {
                display
                short
                var
                type
                filterString
                showColumnDefault
            }
        }
        getItemStatInfo {
            display
            short
            var
            type
            filterString
            showColumnDefault
        }
    }
    `;

    try {
        var data = await apiUtils.postAsync({
            url: `http://localhost:${process.env.PORT}/api`,
            form: {query}
        });
    }
    catch (e) {
        return next(e);
    }

    let statInfo = data.getItemStatInfo;
    let selectedColumns = [];
    if (req.cookies.sc2) {
        selectedColumns = req.cookies.sc2.split('-');
    }
    else {
        for (let i = 0; i < statInfo.length; ++i) {
            if (statInfo[i].showColumnDefault) {
                selectedColumns.push(statInfo[i].short);
            }
        }
    }

    let vm = {
        itemStatCategories: data.getItemStatCategories,
        selectedColumns: selectedColumns
    };
    res.render("builder/index", {title: "Builder", vm});
});

module.exports = router;
