#!usr/bin/node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var fs = require("fs");
/**
 * MDPT -> MinecraftDatapack+ transpiler
 * and file extension is .mdp (MinecraftDatapack+)
 */
var types = [
    "coordinatesX",
    "coordinatesY",
    "coordinatesZ"
];
var File = /** @class */ (function () {
    function File(filePath) {
        var _this = this;
        this.getData = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, fs.promises.readFile(this.filePath, 'utf8')];
                    case 1:
                        _a.data = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        //parse the data to get the different definities
        this.parseData = function () { return __awaiter(_this, void 0, void 0, function () {
            var definitions, data, _i, definitions_1, definition, regexes, type, _loop_1, this_1, _a, regexes_1, regex;
            return __generator(this, function (_b) {
                definitions = this.regexes.definitions;
                data = this.data;
                for (_i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
                    definition = definitions_1[_i];
                    regexes = definition.regexes;
                    type = definition.type;
                    _loop_1 = function (regex) {
                        var matches = data.match(regex);
                        if (matches) {
                            var _loop_2 = function (match) {
                                if (type == "function") {
                                    var data_1 = regex.exec(match);
                                    if (!data_1)
                                        data_1 = regex.exec(match);
                                    var groups = data_1 === null || data_1 === void 0 ? void 0 : data_1.groups;
                                    var func = {
                                        name: groups.name,
                                        args: {},
                                        body: groups.body,
                                        filePath: groups.name.split("::").join("/"),
                                        transpiled: ""
                                    };
                                    if (groups.args) {
                                        var args = groups.args.split(",");
                                        for (var _d = 0, args_1 = args; _d < args_1.length; _d++) {
                                            var arg = args_1[_d];
                                            var argData = arg.split(":");
                                            if (!argData[1])
                                                throw new Error("Argument is missing a type");
                                            func.args[argData[0]] = argData[1];
                                        }
                                    }
                                    this_1.functions.push(func);
                                }
                                else if (type == "variable") {
                                    var data_2 = regex.exec(match);
                                    if (!data_2)
                                        data_2 = regex.exec(match);
                                    var groups_1 = data_2 === null || data_2 === void 0 ? void 0 : data_2.groups;
                                    groups_1.value = groups_1.value.trim();
                                    var scope_1 = "global";
                                    this_1.functions.forEach(function (func) {
                                        var funcData = regex.exec(func.body);
                                        if (!funcData)
                                            funcData = regex.exec(func.body);
                                        if (funcData === null || funcData === void 0 ? void 0 : funcData.groups) {
                                            funcData.groups.value = funcData === null || funcData === void 0 ? void 0 : funcData.groups.value.trim();
                                            var setOfValues = new Set(__spreadArray(__spreadArray([], Object.values(funcData === null || funcData === void 0 ? void 0 : funcData.groups), true), Object.values(groups_1), true));
                                            if (setOfValues.size == 3) {
                                                groups_1.name = func.name + "::" + groups_1.name;
                                                scope_1 = func.name;
                                            }
                                            ;
                                        }
                                    });
                                    switch (groups_1.type) {
                                        case ("file"): {
                                            var filePath = groups_1.name;
                                            var fileData = groups_1.value;
                                            this_1.variables.push({ filePath: filePath, fileData: fileData, type: "file" });
                                            break;
                                        }
                                        case ("coordinatesX"): {
                                            this_1.variables.push({ value: groups_1.value, type: groups_1.type, name: groups_1.name });
                                            break;
                                        }
                                        case ("coordinatesY"): {
                                            this_1.variables.push({ value: groups_1.value, type: groups_1.type, name: groups_1.name });
                                            break;
                                        }
                                        case ("coordinatesZ"): {
                                            this_1.variables.push({ value: groups_1.value, type: groups_1.type, name: groups_1.name });
                                            break;
                                        }
                                        default: {
                                            this_1.variables.push({ value: groups_1.value, type: groups_1.type, name: groups_1.name });
                                            if (scope_1 != "global") {
                                                var func = this_1.functions.filter(function (func) { return func.name == scope_1; })[0];
                                                func.body = func.body.replace(regex, "data modify storage ".concat(this_1.datapackData.name, " ").concat(groups_1.name.split("::").join("."), " set value ").concat(groups_1.value));
                                            }
                                        }
                                    }
                                    if (groups_1.name == "_data") {
                                        if (groups_1.type == "name")
                                            this_1.datapackData.name = groups_1.value;
                                        if (groups_1.type == "pack_format")
                                            this_1.datapackData.pack_format = parseInt(groups_1.value);
                                        if (groups_1.type == "description")
                                            this_1.datapackData.description = groups_1.value;
                                        return "continue";
                                    }
                                }
                                else if (type == "SyntaxError") {
                                    console.error("SyntaxError: " + match + "at: " + match);
                                }
                            };
                            for (var _c = 0, matches_1 = matches; _c < matches_1.length; _c++) {
                                var match = matches_1[_c];
                                _loop_2(match);
                            }
                        }
                    };
                    this_1 = this;
                    for (_a = 0, regexes_1 = regexes; _a < regexes_1.length; _a++) {
                        regex = regexes_1[_a];
                        _loop_1(regex);
                    }
                }
                return [2 /*return*/];
            });
        }); };
        this.compile = function () { return __awaiter(_this, void 0, void 0, function () {
            var packData, _i, _a, func, filePath, path, i, p, file, body, args, name_1, _b, _c, file, filePath, path, i, p, f;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!fs.existsSync(this.outPath))
                            fs.mkdirSync(this.outPath);
                        if (!fs.existsSync("".concat(this.outPath, "/").concat(this.datapackData.name)))
                            fs.mkdirSync("".concat(this.outPath, "/").concat(this.datapackData.name));
                        packData = {
                            "pack": {
                                "pack_format": this.datapackData.pack_format ? this.datapackData.pack_format : 9,
                                "description": this.datapackData.description ? this.datapackData.description : "Compiled using MDPT"
                            }
                        };
                        fs.writeFileSync("".concat(this.outPath, "/").concat(this.datapackData.name, "/pack.mcmeta"), JSON.stringify(packData), { flag: "w" });
                        _i = 0, _a = this.functions;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        func = _a[_i];
                        filePath = func.filePath;
                        path = "".concat(this.outPath, "/").concat(this.datapackData.name, "/data/").concat(this.datapackData.name, "/functions/").concat(filePath, ".mcfunction").split("/").slice(0, -1);
                        for (i = 1; i <= path.length; i++) {
                            p = path.slice(0, i).join("/");
                            if (!fs.existsSync(p))
                                fs.mkdirSync(p);
                        }
                        return [4 /*yield*/, fs.promises.writeFile("".concat(this.outPath, "/").concat(this.datapackData.name, "/data/").concat(this.datapackData.name, "/functions/").concat(filePath, ".mcfunction"), func.body, { flag: "w" })];
                    case 2:
                        file = _d.sent();
                        body = func.body;
                        args = func.args;
                        name_1 = func.name;
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _b = 0, _c = this.variables.filter(function (x) { return x.type == "file"; });
                        _d.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 8];
                        file = _c[_b];
                        filePath = file.filePath;
                        path = "".concat(this.outPath, "/").concat(this.datapackData.name, "/data/").concat(filePath).split("/").slice(0, -1);
                        for (i = 1; i <= path.length; i++) {
                            p = path.slice(0, i).join("/");
                            if (!fs.existsSync(p))
                                fs.mkdirSync(p);
                        }
                        return [4 /*yield*/, fs.promises.writeFile("".concat(this.outPath, "/").concat(this.datapackData.name, "/data/").concat(filePath), file.fileData, { flag: "w" })];
                    case 6:
                        f = _d.sent();
                        _d.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        this.regexes = {
            definitions: [
                {
                    type: "function",
                    regexes: [
                        /(?<function>func\s+(?<name>[a-zA-Z0-9_:]+)\s*\((\s\S)*(?<args>.*?)\)\s+{(?<body>[\s\S]*?)})/gmi
                    ]
                },
                {
                    type: "variable",
                    regexes: [
                        /var\s+(?<name>[a-zA-Z0-9_\/.]+):\s*?(?<type>[a-zA-Z0-9_]+)\s*?=\s*?(?<value>[\s\S]*?);/gm
                    ]
                },
                {
                    type: "functioncall",
                    regexes: [
                        /(?<name>[a-zA-Z0-9_:]+)\(+(?<args>.*?)\)/gm
                    ]
                },
                {
                    type: "SyntaxError",
                    regexes: [
                        /var\s+(?<name>[a-zA-Z0-9_\/.]+):\s*?(?<type>[a-zA-Z0-9_]+)\s*?=\s*?(?<value>[\s\S]*?)/gm
                    ]
                }
            ]
        };
        this.filePath = filePath;
        this.functions = [];
        this.datapackData = { name: "output" };
        this.variables = [];
    }
    return File;
}());
function main(args) {
    return __awaiter(this, void 0, void 0, function () {
        var inDir, outDir, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!args.length)
                        throw new Error("No targets defined");
                    if (args[0] == "-h" || args[0] == "--help") {
                        console.log("Usage: mdpt [target] [outputTarget] [options]");
                        console.log("Options:");
                        console.log("-h, --help: Show this help");
                        process.exit(0); // stops the compiler from trying to load a "-h" or "--help" file :skull:
                    }
                    inDir = args[0];
                    outDir = args[1] ? args[1] : "./out";
                    file = new File(inDir);
                    file.outPath = outDir;
                    return [4 /*yield*/, file.getData()];
                case 1:
                    _a.sent();
                    file.parseData();
                    file.compile();
                    return [2 /*return*/];
            }
        });
    });
}
main(process.argv.slice(2))["catch"](console.error);
/**
 * current working shit:
 *
 * parser can detect functions and variables
 *
 *
 * parser does transform variables that are in functions
 *
 * parser gives informations for datapackData which are used in pack.mcmeta
 *
 * compiler can compile into a datapack with files at the right place
 * you can choose which file is compiled and where it is compiled with arguments
 *
 * you can compile custom files with variables that have the file type
 *
 * show the help with -h or --help as arg
 */ 
