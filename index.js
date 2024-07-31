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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var github = require("@actions/github");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var token, lock, repository, owner, branch, kit, query, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    token = core.getInput("token");
                    if (!token) {
                        throw new Error("Expected a token but got: \"".concat(token, "\""));
                    }
                    lock = core.getBooleanInput("lock");
                    repository = core.getInput("repository");
                    if (!repository) {
                        repository = github.context.repo.repo;
                        core.notice("No repository provided, using \"".concat(repository, "\""));
                    }
                    owner = core.getInput("owner");
                    if (!owner) {
                        owner = github.context.repo.owner;
                        core.notice("No owner provided, using \"".concat(owner, "\""));
                    }
                    branch = core.getInput("branch");
                    if (!branch) {
                        branch = github.context.ref;
                        // GitHub Actions ref can be a tag or branch
                        if (branch.startsWith("refs/heads/")) {
                            branch = branch.replace("refs/heads/", "");
                        }
                        else if (branch.startsWith("refs/tags/")) {
                            branch = branch.replace("refs/tags/", "");
                        }
                        core.notice("No branch provided, using \"".concat(branch, "\""));
                    }
                    core.notice("".concat(lock ? "locking" : "unlocking", " branch=\"").concat(branch, "\" repository=\"").concat(repository, "\" owner=\"").concat(owner, "\""));
                    core.setOutput("branch", branch);
                    core.setOutput("repository", repository);
                    core.setOutput("owner", owner);
                    core.setOutput("locked", lock);
                    core.setOutput("unlocked", !lock);
                    kit = github.getOctokit(token);
                    if (!kit) {
                        throw new Error("Failed to initialize octokit: ".concat(kit));
                    }
                    query = "query getBranchProtections {\n  repository(owner: \"".concat(owner, "\", name: \"").concat(repository, "\"){\n    branchProtectionRules(first: 100){\n      nodes{\n        lockBranch\n        id\n        matchingRefs(first: 100){\n          nodes{\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}");
                    core.notice(query);
                    return [4 /*yield*/, kit.graphql(query)];
                case 1:
                    response = _a.sent();
                    core.notice("Branch Protection JSON: ".concat(JSON.stringify(response, null, 2)));
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    core.setOutput("changed", false);
                    core.setOutput("success", false);
                    core.setOutput("failure", true);
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main();
