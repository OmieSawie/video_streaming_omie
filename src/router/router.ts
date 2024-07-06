import express from "express";
import updateTitle from "../controllers/updateTitle";
import { getAuth, handleCallback } from "../controllers/googleOauth";
const router = express.Router();

router.get("/auth", getAuth);
router.get("/oauth2callback", handleCallback);
router.post("/update", updateTitle);

export default router;
