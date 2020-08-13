let isEmpty = (txt) => {
    return (!txt || /^\s*$/.test(txt));
};
exports.isEmpty = (txt) => {
    return isEmpty(txt);
}

let dataTypeIsValid = (txt) => {
    if (txt.trim() === "TEXT" || txt.trim() === "INTEGER" || txt.trim() === "BOOLEAN") {
        return true;
    }
    return false;
};

exports.dataTypeIsValid = (txt) => {
    return dataTypeIsValid(txt);
}

let isInteger = (txt) => {
    if (Number.isInteger(txt)) return true;
    return false;
};
exports.isInteger = (txt) => {
    return isInteger(txt);
}

let isBoolean = (txt) => {
    if (Number.isInteger(txt) && (txt === 1 || txt === 0)) return true;
    return false;
};
exports.isBoolean = (txt) => {
    return isBoolean(txt);
}

let isText = (txt) => {
    if (typeof txt === 'string') return true;
};

exports.isText = (txt) => {
    return isText(txt);

}

exports.isColumnExist = (key, spec) => {
    return this.isColumnExist(key, spec);
};

let isColumnExist = (key, spec) => {
    if (key.trim() !== spec.columnName) return false;
    return true;
}

let dataIsValid = (key, params, spec) => {
    if (params.length != spec.length) {
        return "The query must have " + spec.length + " parameters!";
    } else {
        for (let i = 0; i < params.length; i++) {
            if (!isColumnExist(key[i], spec[i])) {
                return "The column " + key[i].trim() + " does not exist!";
            } else if (spec[i].dataType.trim() === "TEXT" && !isText(params[i])) {
                return "The " + (i + 1) + " parameter should be in TEXT data type!";
            } else if (spec[i].dataType.trim() === "INTEGER" && !isInteger(params[i])) {
                return "The " + (i + 1) + " parameter should be in INTEGER data type!";
            } else if (spec[i].dataType.trim() === "BOOLEAN" && !isBoolean(params[i])) {
                return "The " + (i + 1) + " parameter should be in BOOLEAN data type!";
            }
        }
    }
    return "1";
};

exports.dataIsValid = (key, params, spec) => {
    return dataIsValid(key, params, spec);
}

