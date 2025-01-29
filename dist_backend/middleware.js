"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET_KEY = void 0;
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET_KEY = "mysecretkey";
exports.JWT_SECRET_KEY = JWT_SECRET_KEY;
function userMiddleware(req, res, next) {
    const token = req.headers.token;
    if (typeof token !== "string") {
        res.status(401).json({ message: "You have not logged in before" });
        return;
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY);
    if (decodedToken) {
        req.body.userId = decodedToken;
        next();
    }
    else {
        res.status(401).json({
            message: "Token Expired or Invalid Token ",
        });
    }
}
