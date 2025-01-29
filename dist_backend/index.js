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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const middleware_1 = require("./middleware");
const db_1 = require("./db");
const utils_1 = require("./utils");
const { ObjectId } = require("mongoose").Types;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongoose_1.default.connect("mongodb+srv://omkarspatil:BqnWhFkTKZGJQYfV@test.xslxo.mongodb.net/second-brain");
        console.log("Connected to Database");
    });
}
main();
const UserSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20),
    password: zod_1.z.string().min(6).max(20),
});
const ContentSchema = zod_1.z.object({
    link: zod_1.z.string(),
    type: zod_1.z.string(),
    title: zod_1.z.string()
});
app.post("/api/v1/signup", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const requiredBody = UserSchema.safeParse(req.body);
        if (!requiredBody.success) {
            res.status(400).json({
                message: "Invalid Data",
                error: requiredBody.error.errors
            });
            return;
        }
        const { username, password } = requiredBody.data;
        try {
            const existingUser = yield db_1.User.findOne({ username: username });
            if (existingUser) {
                res.status(409).json({
                    message: "User Already Exists"
                });
                return;
            }
            else {
                const hashed = bcrypt_1.default.hashSync(password, 10);
                yield db_1.User.create({
                    username: username,
                    password: hashed,
                });
                res.json({
                    message: "You are signed-up"
                });
            }
        }
        catch (error) {
            res.status(500).json({
                message: "Sorry, something went wrong",
            });
        }
    });
});
app.post("/api/v1/signin", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const requiredBody = UserSchema.safeParse(req.body);
        if (!requiredBody.success) {
            res.status(400).json({
                message: "Invalid Data",
                error: requiredBody.error.errors
            });
            return;
        }
        const { username, password } = requiredBody.data;
        try {
            const user = yield db_1.User.findOne({ username: username });
            if (!user) {
                res.status(401).json({
                    message: "User not exists\nPlease signup first"
                });
                return;
            }
            const match = bcrypt_1.default.compareSync(password, user.password);
            if (match) {
                const token = jsonwebtoken_1.default.sign({ userId: user._id }, middleware_1.JWT_SECRET_KEY);
                res.json({
                    message: "You are signed in",
                    token: token
                });
            }
            else {
                res.status(401).json({
                    message: "Incorrect Password"
                });
                return;
            }
        }
        catch (error) {
            res.status(500).json({
                message: "Error occured while signing in\nPlease try again",
            });
        }
    });
});
app.post("/api/v1/content", middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const _id = req.body.userId.userId;
        const requiredBody = ContentSchema.safeParse(req.body);
        const newId = new ObjectId(_id);
        if (!requiredBody.success) {
            res.status(400).json({
                message: "Invalid Data",
                error: requiredBody.error.errors
            });
            return;
        }
        const { link, type, title } = requiredBody.data;
        try {
            const content = yield db_1.Content.create({
                link: link,
                type: type,
                title: title,
                userId: newId
            });
            res.status(201).json({
                message: "Content created successfully",
                data: content
            });
        }
        catch (error) {
            console.error("Error details:", error);
            res.status(500).json({
                message: "Error occurred while saving content. Please try again."
            });
        }
    });
});
app.get("/api/v1/content", middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const _id = new ObjectId(req.body.userId.userId);
        if (!_id) {
            res.status(400).json({ message: "Missing userId" });
            return;
        }
        try {
            const content = yield db_1.Content.find({ userId: _id });
            res.status(200).json({ data: content });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Something went wrong" });
        }
        return;
    });
});
app.delete("/api/v1/content", middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const contentId = new ObjectId(req.body.contentId);
        if (!contentId) {
            res.status(400).json({ message: "Missing Content" });
            return;
        }
        const _id = new ObjectId(req.body.userId.userId);
        if (!_id) {
            res.status(400).json({ message: "Missing userId" });
            return;
        }
        try {
            const deleted = yield db_1.Content.deleteMany({ _id: contentId, userId: _id });
            res.status(200).json({ message: "Deleted", deleted });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Something went wrong" });
        }
    });
});
app.post("/api/v1/brain/share", middleware_1.userMiddleware, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const share = req.body.share;
        const _id = new ObjectId(req.body.userId.userId);
        if (share) {
            const existingLink = yield db_1.Link.findOne({ userId: _id });
            if (share === 'check') {
                if (existingLink)
                    res.json({ message: true, hash: existingLink.hash });
                else
                    res.json({ message: false });
                return;
            }
            if (share === 'true') {
                const hash = (0, utils_1.random)(10);
                yield db_1.Link.create({
                    userId: _id,
                    hash: hash
                });
                res.json({
                    hash
                });
            }
            else {
                yield db_1.Link.deleteOne({
                    userId: _id
                });
                res.json({
                    message: "Link Removed Successfully",
                    status: true
                });
            }
        }
    });
});
app.get("/api/v1/brain/:shareLink", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = req.params.shareLink;
        const link = yield db_1.Link.findOne({ hash });
        if (!link) {
            res.status(411).json({ message: "Invalid Link" });
            return;
        }
        try {
            const content = yield db_1.Content.find({
                userId: link.userId
            });
            const user = yield db_1.User.findOne({
                _id: link.userId
            });
            res.json({
                username: user === null || user === void 0 ? void 0 : user.username,
                data: content
            });
        }
        catch (error) {
            res.status(500).json({ message: "Something went wrong", error });
        }
    });
});
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
