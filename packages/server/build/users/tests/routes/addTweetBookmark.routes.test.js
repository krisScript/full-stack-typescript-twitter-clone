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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mjml_1 = __importDefault(require("mjml"));
const app_1 = __importDefault(require("src/app"));
const User_1 = __importDefault(require("@users/User"));
const Tweet_1 = __importDefault(require("@tweets/Tweet"));
const connectToDB_1 = __importDefault(require("@utilities/connectToDB"));
const port = process.env.PORT || 8080;
const mockTemplate = 'MockTemplate';
mjml_1.default.mockReturnValue(mockTemplate);
jest.mock('mjml');
jest.mock('@utilities/sendEmail');
describe('userRoutes', () => {
    const { MONGO_USER, MONGO_PASSWORD, MONGO_DATABASE } = process.env;
    const mongoURI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ol9wi.mongodb.net/${MONGO_DATABASE}?retryWrites=true`;
    const username = 'username';
    const handle = 'testUserHandle';
    const email = 'testmail@mail.com';
    const password = 'testPassword';
    let testUser;
    let tweet;
    let tweetId;
    let userId;
    let token;
    const secret = process.env.SECRET;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        testUser = new User_1.default({
            username,
            handle,
            email,
            password,
            isConfirmed: true,
        });
        yield testUser.save();
        userId = testUser._id;
        tweet = new Tweet_1.default({
            type: 'text',
            text: 'sadasdasdads',
            user: userId,
        });
        yield tweet.save();
        tweetId = tweet._id;
        token = jsonwebtoken_1.default.sign({
            userId,
        }, secret, { expiresIn: '1h' });
    }));
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
        yield (0, connectToDB_1.default)(mongoURI);
        app_1.default.listen(port);
        yield User_1.default.deleteMany({}).exec();
        yield Tweet_1.default.deleteMany({}).exec();
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.default.deleteMany({}).exec();
        yield Tweet_1.default.deleteMany({}).exec();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.disconnect();
    }));
    describe('patch /users/tweets/:tweetId/bookmark', () => {
        it('should add a tweet bookmark', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/users/tweets/${tweetId}/bookmark`)
                .set('Authorization', `Bearer ${token}`);
            const user = yield User_1.default.findById(userId);
            if (!user)
                return;
            expect(response.status).toBe(200);
            expect(user.bookmarks.length).toBe(1);
            expect(user.bookmarks[0].equals(tweetId)).toBeTruthy();
        }));
        it('should remove a tweet bookmark', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(3);
            testUser.bookmarks = [tweetId];
            yield testUser.save();
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/users/tweets/${tweetId}/bookmark`)
                .set('Authorization', `Bearer ${token}`);
            const user = yield User_1.default.findById(userId);
            if (!user)
                return;
            expect(response.status).toBe(200);
            expect(user.bookmarks.length).toBe(0);
            expect(user.bookmarks[0]).toBeUndefined();
        }));
        it('should throw an error with a status of 401: Unauthorized when there is no authorization header or its contents are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const response = yield (0, supertest_1.default)(app_1.default).patch(`/users/tweets/${tweetId}/bookmark`);
            expect(response.status).toBe(401);
        }));
        it("should throw an error with a status of 404: NotFound when the user doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            expect.assertions(1);
            const notFoundToken = jsonwebtoken_1.default.sign({
                userId: mongoose_1.default.Types.ObjectId().toString(),
            }, secret, { expiresIn: '1h' });
            const response = yield (0, supertest_1.default)(app_1.default)
                .patch(`/users/tweets/${tweetId}/bookmark`)
                .set('Authorization', `Bearer ${notFoundToken}`);
            expect(response.status).toBe(404);
        }));
    });
});
