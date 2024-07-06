import dotenv from "dotenv";
import path from "path";
import { google, youtube_v3 } from "googleapis";
import { OAuth2Client } from "google-auth-library";

dotenv.config({
  path: path.resolve(__dirname, "../../config/.env.development"),
});

const oauth2Client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

let lastViewCount: number | null = null;

async function getYTvideos(): Promise<number> {
  try {
    const params = {
      id: ["7a5yXOZaeOU"],
      key: process.env.API_KEY as string,
      fields: "items(id,snippet(channelId,title,categoryId),statistics)",
      part: ["snippet", "statistics"],
    };
    const result = await youtube.videos.list(params);
    // @ts-expect-error
    const videoDetails = result.data.items[0];

    if (videoDetails) {
      // @ts-expect-error
      const views = +videoDetails.statistics.viewCount;
      return views;
    } else {
      throw new Error("Video not found");
    }
  } catch (err) {
    console.error("Error in fetching video data", err);
    throw err;
  }
}

async function updateYTvideoTitle(
  newTitle: string,
): Promise<youtube_v3.Schema$Video> {
  try {
    const videoId = "7a5yXOZaeOU";

    const getParams = {
      id: [videoId],
      part: ["snippet"],
    };
    const getResult = await youtube.videos.list(getParams);
    // @ts-expect-error
    const videoDetails = getResult.data.items[0];

    if (!videoDetails) {
      throw new Error("Video not found");
    }

    // @ts-expect-error
    videoDetails.snippet.title = newTitle;

    const updateParams = {
      part: ["snippet"],
      requestBody: {
        id: videoId,
        snippet: {
          title: newTitle,
          // @ts-expect-error
          description: videoDetails.snippet.description,
          // @ts-expect-error
          tags: videoDetails.snippet.tags,
          // @ts-expect-error
          categoryId: videoDetails.snippet.categoryId,
        },
      },
    };
    const updateResult = await youtube.videos.update(updateParams);
    return updateResult.data;
  } catch (err) {
    console.error("Error in updating video title", err);
    throw err;
  }
}

async function checkAndUpdateVideoTitle() {
  try {
    const currentViews = await getYTvideos();

    if (lastViewCount === null || currentViews !== lastViewCount) {
      const newTitle = `This video has exactly ${currentViews} views!!`;
      await updateYTvideoTitle(newTitle);
      console.log("Video title updated successfully:", newTitle);
      lastViewCount = currentViews;
    } else {
      console.log("No change in views. Skipping title update.");
    }
  } catch (err) {
    console.error("Error in checking or updating video title", err);
  }
}

export default checkAndUpdateVideoTitle;
