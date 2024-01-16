import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const questionRouter = Router();

questionRouter.get("/", async (req, res) => {
    try {
        const collection = db.collection("questions");

        let limit = Number(req.query.limit) || 10;
        const { title, category } = req.query;

        const query = {};

        if (category) {
            query.category = category;
        }

        if (title) {
            query.title = new RegExp(title, "i");
        }

        if (limit > 10) {
            limit = 10;
        }
        const questions = await collection.find(query).limit(limit).sort({ created_at: -1 }).toArray();

        return res.json({
            data: questions,
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.get("/:questionId", async (req, res) => {
    try {
        const collection = db.collection("questions");

        const questionId = new ObjectId(req.params.questionId);

        const question = await collection.findOne({ _id: questionId });

        return res.json({
            data: question,
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.get("/:questionId/answers", async (req, res) => {
    try {
        const collection = db.collection("answers");

        let limit = Number(req.query.limit) || 10;

        if (limit > 10) {
            limit = 10;
        }

        const questionId = new ObjectId(req.params.questionId);

        const answers = await collection
            .find({ question_id: questionId })
            .limit(limit)
            .sort({ created_at: -1 })
            .toArray();

        return res.json({
            data: answers,
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.post("/", async (req, res) => {
    try {
        const collection = db.collection("questions");

        const questionData = { ...req.body, agree_count: 0, created_at: new Date() };

        await collection.insertOne(questionData);

        return res.json({
            message: "question has been created successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.post("/:questionId/answers", async (req, res) => {
    try {
        const collection = db.collection("answers");

        const questionId = new ObjectId(req.params.questionId);
        let inputAnwer = req.body.answer;

        if (inputAnwer.length > 300) {
            inputAnwer = inputAnwer.slice(0, 300);
        }

        const answerData = { question_id: questionId, answer: inputAnwer, agree_count: 0, created_at: new Date() };
        await collection.insertOne(answerData);

        return res.json({
            message: "answer has been created successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.put("/:questionId", async (req, res) => {
    try {
        const collection = db.collection("questions");

        const questionId = new ObjectId(req.params.questionId);

        const newQuestionData = { ...req.body };

        await collection.updateOne(
            {
                _id: questionId,
            },
            {
                $set: newQuestionData,
            }
        );

        return res.json({
            message: "question has been updated successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.put("/:questionId/agree", async (req, res) => {
    try {
        const collection = db.collection("questions");

        const questionId = new ObjectId(req.params.questionId);

        const newAgreeCount = req.body.agreeCount;

        await collection.updateOne(
            {
                _id: questionId,
            },
            {
                $set: { agree_count: newAgreeCount },
            }
        );

        return res.json({
            message: "agree has been updated successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.put("/:questionId/answers/:answerId/agree", async (req, res) => {
    try {
        const collection = db.collection("answers");

        const answersId = new ObjectId(req.params.answerId);

        const newAgreeCount = req.body.agreeCount;

        await collection.updateOne(
            {
                _id: answersId,
            },
            {
                $set: { agree_count: newAgreeCount },
            }
        );

        return res.json({
            message: "agree has been updated successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

questionRouter.delete("/:questionId", async (req, res) => {
    try {
        const questionCollection = db.collection("questions");
        const answerCollection = db.collection("answers");

        const questionId = new ObjectId(req.params.questionId);

        await questionCollection.deleteOne({ _id: questionId });
        await answerCollection.deleteMany({ question_id: questionId });

        return res.json({
            message: "question has been deleted successfully",
        });
    } catch (error) {
        return res.json({
            message: `${error}`,
        });
    }
});

export default questionRouter;
