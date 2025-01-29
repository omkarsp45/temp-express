"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Link = exports.Content = exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const ContentSchema = new mongoose_1.Schema({
    link: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }
});
const linkSchema = new mongoose_1.Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }
});
exports.User = (0, mongoose_1.model)("User", UserSchema);
exports.Content = (0, mongoose_1.model)("Content", ContentSchema);
exports.Link = (0, mongoose_1.model)("link", linkSchema);
