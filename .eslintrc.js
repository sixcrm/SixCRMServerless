module.exports = {
    "env": {
        "node": true,
        "es6": true,
        "mocha": true
    },
    "plugins": [
        "promise"
    ],
    "extends": [
        "eslint:recommended"
    ],
    "rules": {
        "indent": ["warn", 4],
        "linebreak-style": [ "error", "unix" ],
        "newline-after-var": ["warn", "always"],
        //"newline-per-chained-call": ["warn", { "ignoreChainWithDepth": 2 }],
        "no-console": [ "warn" ],
        "no-extra-semi": [ "off" ],
        "no-trailing-spaces": [ "warn" ],
        "no-mixed-spaces-and-tabs": "off",
        "no-unused-vars": [ "warn" ],
        "promise/always-return": "warn",
        "promise/catch-or-return": "warn",
        "promise/no-return-wrap": "warn",
        "promise/param-names": "warn"
    }
};
