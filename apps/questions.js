import { Router } from "express";
import { db } from "../utils/db.js";
import { ObjectId } from "mongodb";

const questionRouter = Router();

const collection = db.collection("questions");

questionRouter.get("/", async (req, res) => {
    try {
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

questionRouter.post("/", async (req, res) => {
    try {
        const questionData = { ...req.body, created_at: new Date() };

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

questionRouter.put("/:questionId", async (req, res) => {
    try {
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

questionRouter.delete("/:questionId", async (req, res) => {
    try {
        const questionId = new ObjectId(req.params.questionId);

        await collection.deleteOne({ _id: questionId });

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
