/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "GET",
  "/liked/{id}",
  (e) => {
    const id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${id}`;
    try {
      const reaction = e.app.findRecordById("post_reactions", gen_id);
      return e.json(200, {
        data: reaction.get("like_dislike") == 1 ? "liked" : "disliked",
        message: "reaction found",
      });
    } catch (err) {
      return e.json(200, {
        data: null,
        message: "no reaction",
      });
    }
  },
  $apis.requireAuth(),
);

routerAdd(
  "POST",
  "/like/{id}",
  (e) => {
    const video_id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${video_id}`;
    try {
      let reaction;
      try {
        reaction = e.app.findRecordById("post_reactions", gen_id);
        // record exists — update it
        reaction.set("like_dislike", 1);
        e.app.save(reaction);
        return e.json(200, { data: gen_id, message: "updated to liked" });
      } catch (_) {
        // record doesn't exist — create it
        const pr_col = e.app.findCollectionByNameOrId("post_reactions");
        reaction = new Record(pr_col);
        reaction.set("id", gen_id);
        reaction.set("like_dislike", 1);
        reaction.set("user", user_id);
        reaction.set("post", video_id);
        e.app.save(reaction);
        return e.json(201, { data: gen_id, message: "video liked" });
      }
    } catch (err) {
      console.log("failed to like video:", err);
      return e.json(500, { data: null, message: "internal server error" });
    }
  },
  $apis.requireAuth(),
);

routerAdd(
  "POST",
  "/dislike/{id}",
  (e) => {
    const video_id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${video_id}`;
    try {
      let reaction;
      try {
        reaction = e.app.findRecordById("post_reactions", gen_id);
        // record exists — update it
        reaction.set("like_dislike", 0);
        e.app.save(reaction);
        return e.json(200, { data: gen_id, message: "updated to disliked" });
      } catch (_) {
        // record doesn't exist — create it
        const pr_col = e.app.findCollectionByNameOrId("post_reactions");
        reaction = new Record(pr_col);
        reaction.set("id", gen_id);
        reaction.set("like_dislike", 0);
        reaction.set("user", user_id);
        reaction.set("post", video_id);
        e.app.save(reaction);
        return e.json(201, { data: gen_id, message: "video disliked" });
      }
    } catch (err) {
      console.log("failed to dislike video:", err);
      return e.json(500, { data: null, message: "internal server error" });
    }
  },
  $apis.requireAuth(),
);

routerAdd(
  "POST",
  "/remove_like/{id}",
  (e) => {
    const video_id = e.request.pathValue("id");
    const info = e.requestInfo();
    const user_id = info.auth?.id;
    const gen_id = `${user_id}${video_id}`;
    try {
      const reaction = e.app.findRecordById("post_reactions", gen_id);
      e.app.delete(reaction);
      return e.json(200, { data: gen_id, message: "reaction removed" });
    } catch (err) {
      return e.json(404, { data: null, message: "reaction not found" });
    }
  },
  $apis.requireAuth(),
);

// on create: increment the relevant count
onRecordAfterCreateSuccess((e) => {
  const number = e.record?.get("like_dislike");
  const post_id = e.record?.get("post");
  if (!post_id) return e.next();

  try {
    const post = e.app.findRecordById("posts", post_id);
    if (number == 1) {
      post.set("likes_count", post.get("likes_count") + 1);
    } else if (number == 0) {
      post.set("dislikes_count", post.get("dislikes_count") + 1);
    }
    e.app.save(post);
  } catch (err) {
    console.log("failed to update post counts:", err);
  }

  return e.next();
}, "post_reactions");

// on update: swap counts when like_dislike flips
onRecordAfterUpdateSuccess((e) => {
  const number = e.record?.get("like_dislike");
  const post_id = e.record?.get("post");
  if (!post_id) return e.next();

  try {
    const post = e.app.findRecordById("posts", post_id);
    if (number == 1) {
      // flipped dislike → like
      post.set("likes_count", post.get("likes_count") + 1);
      post.set("dislikes_count", post.get("dislikes_count") - 1);
    } else if (number == 0) {
      // flipped like → dislike
      post.set("likes_count", post.get("likes_count") - 1);
      post.set("dislikes_count", post.get("dislikes_count") + 1);
    }
    e.app.save(post);
  } catch (err) {
    console.log("failed to update post counts on flip:", err);
  }

  return e.next();
}, "post_reactions");

// on delete: decrement the relevant count
onRecordAfterDeleteSuccess((e) => {
  const number = e.record?.get("like_dislike");
  const post_id = e.record?.get("post");
  if (!post_id) return e.next();

  try {
    const post = e.app.findRecordById("posts", post_id);
    if (number == 1) {
      post.set("likes_count", post.get("likes_count") - 1);
    } else if (number == 0) {
      post.set("dislikes_count", post.get("dislikes_count") - 1);
    }
    e.app.save(post);
  } catch (err) {
    console.log("failed to update post counts on delete:", err);
  }

  return e.next();
}, "post_reactions");
