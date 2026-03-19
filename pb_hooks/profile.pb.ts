/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/hello/{name}", (e) => {
  //@ts-ignore
  let name = e.request.pathValue("name");
  return e.json(200, { message: "Hello " + name });
});

routerAdd(
  "GET",
  "/profile/me",
  (e) => {
    const auth = e.auth?.id;
    // return e.json(404, { message: "Not Found" });
    try {
      //@ts-ignore
      const profile_record = $app.findRecordById("profile", auth);
      return e.json(200, { data: profile_record });
    } catch (error) {
      const profile_collection = e.app.findCollectionByNameOrId("profile");
      if (!profile_collection) {
        return e.json(500, { message: "Internal Server Error" });
      }
      // @ts-ignore
      const user_record = e.app.findRecordById("users", auth);
      const user_name = user_record?.get("name") ?? "";
      const new_profile = new Record(profile_collection);
      new_profile.set("id", auth);
      new_profile.set("user", auth);
      new_profile.set("username", user_name);

      e.app.save(new_profile);
      e.next();
      return e.json(200, { data: new_profile });
    }
    return e.json(404, { message: "Not Found" });
  },
  $apis.requireAuth(),
);

// onRecordsListRequest((e) => {
//   // e.app
//   // e.collection
//   // e.records
//   // e.result
//   // and all RequestEvent fields...
//   console.log("viewing_collection");
//   e.next();
//   console.log("viewing");
