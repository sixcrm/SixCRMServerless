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
        "linebreak-style": [ "error", "unix" ],
        "no-mixed-spaces-and-tabs": "off",
        "no-console": [ "warn" ],
        "no-unused-vars": [ "warn" ],
        "no-extra-semi": [ "off" ],
        "promise/catch-or-return": "warn",
        "promise/no-return-wrap": "warn",
        "promise/param-names": "warn",
        "promise/always-return": "warn"
    }
};
