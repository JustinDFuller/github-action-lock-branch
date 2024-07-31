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
        var token, lock, repository, owner, branch_1, kit, query, response, alreadyLocked, branchProtectionId, _i, _a, rule, data, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
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
                    branch_1 = core.getInput("branch");
                    if (!branch_1) {
                        branch_1 = github.context.ref;
                        // GitHub Actions ref can be a tag or branch
                        if (branch_1.startsWith("refs/heads/")) {
                            branch_1 = branch_1.replace("refs/heads/", "");
                        }
                        else if (branch_1.startsWith("refs/tags/")) {
                            branch_1 = branch_1.replace("refs/tags/", "");
                        }
                        core.notice("No branch provided, using \"".concat(branch_1, "\""));
                    }
                    core.notice("".concat(lock ? "locking" : "unlocking", " branch=\"").concat(branch_1, "\" repository=\"").concat(repository, "\" owner=\"").concat(owner, "\""));
                    core.setOutput("branch", branch_1);
                    core.setOutput("repository", repository);
                    core.setOutput("owner", owner);
                    core.setOutput("locked", lock);
                    core.setOutput("unlocked", !lock);
                    kit = github.getOctokit(token);
                    if (!kit) {
                        throw new Error("Failed to initialize octokit: ".concat(kit));
                    }
                    query = "query getBranchProtections($owner: String!, $repository: String!){\n  repository(owner: $owner, name: $repository){\n    branchProtectionRules(first: 100){\n      nodes{\n        lockBranch\n        id\n        matchingRefs(first: 100){\n          nodes{\n            id\n            name\n          }\n        }\n      }\n    }\n  }\n}";
                    core.debug("Query getBranchProtections: ".concat(query, " ").concat(owner, " ").concat(repository));
                    return [4 /*yield*/, kit.graphql(query, {
                            owner: owner,
                            repository: repository,
                        })];
                case 1:
                    response = _b.sent();
                    core.debug("Branch Protection JSON: ".concat(JSON.stringify(response, null, 2)));
                    if (!response) {
                        throw new Error("Branch protection not found.");
                    }
                    if (!response.repository) {
                        throw new Error("Repository not found.");
                    }
                    if (!response.repository.branchProtectionRules) {
                        throw new Error("Branch protection rules not found.");
                    }
                    if (!response.repository.branchProtectionRules.nodes) {
                        throw new Error("Branch protection rules nodes not found.");
                    }
                    if (!response.repository.branchProtectionRules.nodes.length) {
                        throw new Error("Branch protection rules nodes empty.");
                    }
                    alreadyLocked = void 0;
                    branchProtectionId = void 0;
                    for (_i = 0, _a = response.repository.branchProtectionRules.nodes; _i < _a.length; _i++) {
                        rule = _a[_i];
                        if (rule.matchingRefs.nodes.some(function (n) { return n.name === branch_1; })) {
                            if (!("lockBranch" in rule)) {
                                throw new Error("Lock Branch Setting not found.");
                            }
                            if (!("id" in rule)) {
                                throw new Error("Branch Protection ID not found.");
                            }
                            alreadyLocked = rule.lockBranch;
                            branchProtectionId = rule.id;
                            break;
                        }
                    }
                    if (!branchProtectionId) {
                        throw new Error("Branch protection ID not found.");
                    }
                    if (alreadyLocked === lock) {
                        core.notice("Branch is currently locked=".concat(alreadyLocked, " which is the same as lock setting requested=").concat(lock, ". Stopping here."));
                        core.setOutput("changed", false);
                        core.setOutput("success", true);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, kit.graphql("\n    mutation updateBranchProtections {\n  updateBranchProtectionRule(input: { lockBranch: ".concat(lock, ", branchProtectionRuleId: \"").concat(branchProtectionId, "\" }) {\n    branchProtectionRule{\n      lockBranch\n      id\n    }\n  }\n}\n    "))];
                case 2:
                    data = _b.sent();
                    core.debug("Update Response JSON: ".concat(JSON.stringify(data, null, 2)));
                    core.setOutput("changed", true);
                    core.setOutput("success", true);
                    core.setOutput("failure", false);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    core.setOutput("changed", false);
                    core.setOutput("success", false);
                    core.setOutput("failure", true);
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
