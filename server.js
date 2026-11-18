const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

let assets = [
    {
        "_id": 1,
        "name": "Real Estate",
        "img_name": "real-estate.jpg",
        "category": "Real Assets",
        "risk": "Moderate",
        "typical_return": "6-10%",
        "liquidity": "Low",
        "description": "Physical property such as residential, commercial, and industrial buildings. Returns come from rental income and price appreciation."
    },
    {
        "_id": 2,
        "name": "Commodities",
        "img_name": "commodities.jpg",
        "category": "Raw Assets",
        "risk": "High",
        "typical_return": "3-8%",
        "liquidity": "High",
        "description": "Raw materials like oil, gold, and agricultural products. Prices are driven by supply, demand, and the broader economy."
    },
    {
        "_id": 3,
        "name": "Private Equity",
        "img_name": "private-equity.jpg",
        "category": "Private Markets",
        "risk": "High",
        "typical_return": "12-18%",
        "liquidity": "Very Low",
        "description": "Investment in private companies. Higher return potential than public markets, but capital is often locked up for 10 years or more."
    },
    {
        "_id": 4,
        "name": "Hedge Funds",
        "img_name": "hedge-funds.jpg",
        "category": "Alternative Strategy",
        "risk": "Variable",
        "typical_return": "6-12%",
        "liquidity": "Low",
        "description": "Pooled funds that use strategies like long/short, arbitrage, and global macro to try to earn returns in any market."
    },
    {
        "_id": 5,
        "name": "Digital Assets",
        "img_name": "digital-assets.jpg",
        "category": "Cryptocurrency",
        "risk": "Very High",
        "typical_return": "Highly Variable",
        "liquidity": "High",
        "description": "Decentralized digital currencies and tokens. Prices are volatile and speculative, and the rules around them are still changing."
    },
    {
        "_id": 6,
        "name": "Private Credit",
        "img_name": "private-credit.jpg",
        "category": "Direct Lending",
        "risk": "Moderate",
        "typical_return": "8-12%",
        "liquidity": "Very Low",
        "description": "Loans made directly to companies by lenders that are not banks. They often pay higher yields than public bonds in exchange for less liquidity."
    },
    {
        "_id": 7,
        "name": "Infrastructure",
        "img_name": "infrastructure.jpg",
        "category": "Real Assets",
        "risk": "Low to Moderate",
        "typical_return": "5-9%",
        "liquidity": "Low",
        "description": "Essential assets like toll roads, utilities, pipelines, and airports. Revenue is often set by contracts or regulation and tends to rise with inflation."
    },
    {
        "_id": 8,
        "name": "Collectibles & Art",
        "img_name": "collectibles-art.jpg",
        "category": "Passion Assets",
        "risk": "High",
        "typical_return": "Highly Variable",
        "liquidity": "Very Low",
        "description": "Fine art, rare wine, classic cars, and other collectibles. They produce no income, so returns depend on what a buyer will pay later."
    }
];

app.get("/api/assets", (req, res) => {
    res.send(assets);
});

app.post("/api/assets", upload.single("img"), (req, res) => {
    const result = validateAsset(req.body);

    if (result.error) {
        console.log("Error in validation");
        res.status(400).send(result.error.details[0].message);
        return;
    }

    if (!req.file) {
        res.status(400).send("An image is required");
        return;
    }

    //new id is one more than the biggest id in the list
    let newId = 1;
    assets.forEach((asset) => {
        if (asset._id >= newId) {
            newId = asset._id + 1;
        }
    });

    const asset = {
        _id: newId,
        name: req.body.name,
        img_name: req.file.filename,
        category: req.body.category,
        risk: req.body.risk,
        typical_return: req.body.typical_return,
        liquidity: req.body.liquidity,
        description: req.body.description
    };

    assets.push(asset);

    res.status(200).send(asset);
});

app.put("/api/assets/:id", upload.single("img"), (req, res) => {
    const asset = findAsset(req.params.id);

    if (!asset) {
        res.status(404).send("The asset class with that id was not found");
        return;
    }

    const result = validateAsset(req.body);

    if (result.error) {
        console.log("Error in validation");
        res.status(400).send(result.error.details[0].message);
        return;
    }

    asset.name = req.body.name;
    asset.category = req.body.category;
    asset.risk = req.body.risk;
    asset.typical_return = req.body.typical_return;
    asset.liquidity = req.body.liquidity;
    asset.description = req.body.description;

    //only change the picture if a new one was uploaded
    if (req.file) {
        asset.img_name = req.file.filename;
    }

    res.status(200).send(asset);
});

app.delete("/api/assets/:id", (req, res) => {
    const asset = findAsset(req.params.id);

    if (!asset) {
        res.status(404).send("The asset class with that id was not found");
        return;
    }

    const index = assets.indexOf(asset);
    assets.splice(index, 1);

    res.status(200).send(asset);
});

//returns the asset with the given id, or undefined if there isn't one
const findAsset = (id) => {
    let foundAsset;

    assets.forEach((asset) => {
        if (asset._id === parseInt(id)) {
            foundAsset = asset;
        }
    });

    return foundAsset;
};

const validateAsset = (asset) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        name: Joi.string().min(3).max(40).required(),
        category: Joi.string().min(3).max(40).required(),
        risk: Joi.string().min(3).max(20).required(),
        typical_return: Joi.string().min(2).max(20).required(),
        liquidity: Joi.string().min(3).max(20).required(),
        description: Joi.string().min(10).max(300).required()
    });

    return schema.validate(asset);
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
