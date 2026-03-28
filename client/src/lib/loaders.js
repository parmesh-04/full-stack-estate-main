import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};
export const listPageLoader = async ({ request, params }) => {
  const query = request.url.split("?")[1];
  const searchParams = new URLSearchParams(query);
  
  // If aiSearch param exists, call the AI RAG endpoint
  if (searchParams.get("aiSearch")) {
    const postPromise = apiRequest.post("/ai/search", { query: searchParams.get("aiSearch") });
    return defer({ postResponse: postPromise });
  }

  const postPromise = apiRequest("/posts?" + (query || ""));
  return defer({
    postResponse: postPromise,
  });
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  const chatPromise = apiRequest("/chats");
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
