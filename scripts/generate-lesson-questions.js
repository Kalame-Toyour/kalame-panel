"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var dotenv = __importStar(require("dotenv"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var crypto_1 = __importDefault(require("crypto"));
// Load environment variables
dotenv.config();
// Initialize Prisma client
var prisma = new client_1.PrismaClient();
// Helper function to delay execution
function delay(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
// Helper to generate a hash for a question to prevent duplicates
function generateQuestionHash(questionText, options) {
    var content = "".concat(questionText).concat(options.join(''));
    return crypto_1.default.createHash('sha256').update(content).digest('hex');
}
// Function to generate questions for a lesson
function generateQuestionsForLesson(lesson, book, field, year) {
    return __awaiter(this, void 0, void 0, function () {
        var existingQuestions, questionCount, lessonPlan, questionsNeeded, response, result, _i, _a, q, question, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    console.log("\nGenerating questions for lesson: ".concat(lesson.name));
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      SELECT COUNT(*) as count\n      FROM learning__questions\n      WHERE lesson_id = ", "\n    "], ["\n      SELECT COUNT(*) as count\n      FROM learning__questions\n      WHERE lesson_id = ", "\n    "])), lesson.id)];
                case 1:
                    existingQuestions = _b.sent();
                    questionCount = existingQuestions[0].count;
                    if (questionCount >= 10) {
                        console.log("Lesson ".concat(lesson.name, " already has ").concat(questionCount, " questions, skipping..."));
                        return [2 /*return*/, true];
                    }
                    lessonPlan = lesson.lesson_plan || '';
                    questionsNeeded = 10 - questionCount;
                    console.log("Need to generate ".concat(questionsNeeded, " more questions for lesson ").concat(lesson.name));
                    return [4 /*yield*/, (0, node_fetch_1.default)('http://localhost:3000/api/generate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                lessonId: lesson.id,
                                topic: lesson.name,
                                count: questionsNeeded,
                                lessonPlan: lessonPlan,
                                context: {
                                    book: book.name,
                                    field: field.name,
                                    year: year.name
                                }
                            }),
                        })];
                case 2:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("API responded with status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _b.sent();
                    if (!result.questions || !Array.isArray(result.questions)) {
                        throw new Error('Invalid API response format: questions array is missing');
                    }
                    console.log("Successfully generated ".concat(result.questions.length, " questions for lesson ").concat(lesson.name));
                    _i = 0, _a = result.questions;
                    _b.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    q = _a[_i];
                    if (!q.question || !Array.isArray(q.options) || typeof q.correctAnswer === 'undefined') {
                        console.error('Skipping invalid question:', q);
                        return [3 /*break*/, 8];
                    }
                    question = {
                        question_text: q.question,
                        options: q.options,
                        correct_answer: q.correctAnswer,
                        difficulty: q.difficulty || 1,
                        explanation: q.explanation || '',
                        lesson_id: lesson.id,
                        question_hash: generateQuestionHash(q.question, q.options)
                    };
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    // Save the question to the database
                    return [4 /*yield*/, prisma.question.create({
                            data: {
                                question_text: question.question_text,
                                options: JSON.stringify(question.options),
                                correct_answer: String(question.correct_answer),
                                difficulty_level: question.difficulty,
                                explanation: question.explanation,
                                lesson_id: question.lesson_id,
                                question_hash: question.question_hash,
                                book_id: book.id
                            }
                        })];
                case 6:
                    // Save the question to the database
                    _b.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _b.sent();
                    console.error("Failed to save question for lesson ".concat(lesson.name, ":"), error_1);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9: 
                // Add a delay to avoid rate limiting
                return [4 /*yield*/, delay(5000)];
                case 10:
                    // Add a delay to avoid rate limiting
                    _b.sent();
                    return [2 /*return*/, true];
                case 11:
                    error_2 = _b.sent();
                    console.error("Error generating questions for lesson ".concat(lesson.name, ":"), error_2);
                    return [2 /*return*/, false];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Main function to process all lessons
function processLessons() {
    return __awaiter(this, void 0, void 0, function () {
        var years, totalLessons, processedLessons, skippedLessons, failedLessons, _i, years_1, year, books, _a, books_1, book, lessons, _b, years_2, year, books, booksByField, _c, _d, _e, _f, fieldId, _g, field, books_3, _h, books_2, book, lessons, _j, lessons_1, lesson, success, progress, error_3;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _k.trys.push([0, 22, 23, 25]);
                    console.log('Starting question generation process...');
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      SELECT id, name, name_en FROM learning__year\n    "], ["\n      SELECT id, name, name_en FROM learning__year\n    "])))];
                case 1:
                    years = _k.sent();
                    console.log("Found ".concat(years.length, " learning years"));
                    totalLessons = 0;
                    processedLessons = 0;
                    skippedLessons = 0;
                    failedLessons = 0;
                    _i = 0, years_1 = years;
                    _k.label = 2;
                case 2:
                    if (!(_i < years_1.length)) return [3 /*break*/, 8];
                    year = years_1[_i];
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        SELECT b.id, b.name, b.year_id, lf.id as field_id, lf.name as field_name\n        FROM learning__book b\n        JOIN learning__field lf ON b.field_id = lf.id\n        WHERE b.year_id = ", "\n      "], ["\n        SELECT b.id, b.name, b.year_id, lf.id as field_id, lf.name as field_name\n        FROM learning__book b\n        JOIN learning__field lf ON b.field_id = lf.id\n        WHERE b.year_id = ", "\n      "])), year.id)];
                case 3:
                    books = _k.sent();
                    _a = 0, books_1 = books;
                    _k.label = 4;
                case 4:
                    if (!(_a < books_1.length)) return [3 /*break*/, 7];
                    book = books_1[_a];
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n          SELECT id, name, lesson_plan\n          FROM learning__lessons\n          WHERE book_id = ", "\n        "], ["\n          SELECT id, name, lesson_plan\n          FROM learning__lessons\n          WHERE book_id = ", "\n        "])), book.id)];
                case 5:
                    lessons = _k.sent();
                    totalLessons += lessons.length;
                    _k.label = 6;
                case 6:
                    _a++;
                    return [3 /*break*/, 4];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    console.log("Total lessons to process: ".concat(totalLessons));
                    _b = 0, years_2 = years;
                    _k.label = 9;
                case 9:
                    if (!(_b < years_2.length)) return [3 /*break*/, 21];
                    year = years_2[_b];
                    console.log("\nProcessing year: ".concat(year.name));
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        SELECT b.id, b.name, b.year_id, lf.id as field_id, lf.name as field_name\n        FROM learning__book b\n        JOIN learning__field lf ON b.field_id = lf.id\n        WHERE b.year_id = ", "\n      "], ["\n        SELECT b.id, b.name, b.year_id, lf.id as field_id, lf.name as field_name\n        FROM learning__book b\n        JOIN learning__field lf ON b.field_id = lf.id\n        WHERE b.year_id = ", "\n      "])), year.id)];
                case 10:
                    books = _k.sent();
                    console.log("Found ".concat(books.length, " books for year ").concat(year.name));
                    booksByField = books.reduce(function (acc, book) {
                        if (!acc[book.field_id]) {
                            acc[book.field_id] = {
                                field: { id: book.field_id, name: book.field_name },
                                books: []
                            };
                        }
                        acc[book.field_id].books.push({
                            id: book.id,
                            name: book.name
                        });
                        return acc;
                    }, {});
                    _c = booksByField;
                    _d = [];
                    for (_e in _c)
                        _d.push(_e);
                    _f = 0;
                    _k.label = 11;
                case 11:
                    if (!(_f < _d.length)) return [3 /*break*/, 20];
                    _e = _d[_f];
                    if (!(_e in _c)) return [3 /*break*/, 19];
                    fieldId = _e;
                    _g = booksByField[fieldId], field = _g.field, books_3 = _g.books;
                    console.log("\nProcessing field: ".concat(field.name));
                    console.log("Found ".concat(books_3.length, " books for field ").concat(field.name));
                    _h = 0, books_2 = books_3;
                    _k.label = 12;
                case 12:
                    if (!(_h < books_2.length)) return [3 /*break*/, 19];
                    book = books_2[_h];
                    console.log("\nProcessing book: ".concat(book.name));
                    return [4 /*yield*/, prisma.$queryRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n            SELECT id, name, lesson_plan\n            FROM learning__lessons\n            WHERE book_id = ", "\n            AND lesson_plan IS NOT NULL\n            AND lesson_plan != ''\n          "], ["\n            SELECT id, name, lesson_plan\n            FROM learning__lessons\n            WHERE book_id = ", "\n            AND lesson_plan IS NOT NULL\n            AND lesson_plan != ''\n          "])), book.id)];
                case 13:
                    lessons = _k.sent();
                    console.log("Found ".concat(lessons.length, " lessons with lesson plans for book ").concat(book.name));
                    _j = 0, lessons_1 = lessons;
                    _k.label = 14;
                case 14:
                    if (!(_j < lessons_1.length)) return [3 /*break*/, 18];
                    lesson = lessons_1[_j];
                    processedLessons++;
                    console.log("\nProcessing lesson ".concat(processedLessons, "/").concat(totalLessons, ": ").concat(lesson.name));
                    // Skip if no lesson plan
                    if (!lesson.lesson_plan) {
                        console.log("Skipping lesson ".concat(lesson.name, " - no lesson plan available"));
                        skippedLessons++;
                        return [3 /*break*/, 17];
                    }
                    return [4 /*yield*/, generateQuestionsForLesson(lesson, book, field, year)];
                case 15:
                    success = _k.sent();
                    if (!success) {
                        failedLessons++;
                        console.error("Failed to generate questions for lesson: ".concat(lesson.name));
                    }
                    // Add a delay between lessons to avoid rate limiting
                    return [4 /*yield*/, delay(2000)];
                case 16:
                    // Add a delay between lessons to avoid rate limiting
                    _k.sent();
                    progress = ((processedLessons / totalLessons) * 100).toFixed(2);
                    console.log("Progress: ".concat(progress, "% (").concat(processedLessons, "/").concat(totalLessons, ")"));
                    console.log("Status: Processed=".concat(processedLessons, ", Skipped=").concat(skippedLessons, ", Failed=").concat(failedLessons));
                    _k.label = 17;
                case 17:
                    _j++;
                    return [3 /*break*/, 14];
                case 18:
                    _h++;
                    return [3 /*break*/, 12];
                case 19:
                    _f++;
                    return [3 /*break*/, 11];
                case 20:
                    _b++;
                    return [3 /*break*/, 9];
                case 21:
                    console.log('\nQuestion generation process completed!');
                    console.log("Summary: ".concat(processedLessons, " lessons processed, ").concat(skippedLessons, " skipped, ").concat(failedLessons, " failed"));
                    return [3 /*break*/, 25];
                case 22:
                    error_3 = _k.sent();
                    console.error('Error processing lessons:', error_3);
                    return [3 /*break*/, 25];
                case 23: return [4 /*yield*/, prisma.$disconnect()];
                case 24:
                    _k.sent();
                    return [7 /*endfinally*/];
                case 25: return [2 /*return*/];
            }
        });
    });
}
// Run the script
processLessons().catch(console.error);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
