import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  UserProfile: a
    .model({
      id: a.string().required(),
      userIdentifier: a.string().required(),
      userId: a.string().required(),
      name: a.string(),
      email: a.string(),
      phoneNumber: a.string(),
      profileImagePath: a.string(),
      friendsId: a.string().array(),
      streaks: a.string(),
      completed: a.string().array(),
      isTestimonyPrivate: a.boolean(),
      testimony: a.string(),
      prayerRequests: a.hasMany("PrayerRequest", "creatorId"),
      comments: a.hasMany("Comment", "creatorId"),
      completedChapters: a.hasMany("CompletedChapter", "userId"),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index("userId"), index("userIdentifier")])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
    ]),
  Comment: a
    .model({
      id: a.string().required(),
      postId: a.string().required(), //the thing being commented on
      isPrivate: a.boolean().required(),
      creatorId: a.string().required(),
      creator: a.belongsTo("UserProfile", "creatorId"),
      parentId: a.string(),
      content: a.string().required(),
      reportedUser: a.string().array(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      status: a.string().default("active"), // active | reported | deleted
    })
    .secondaryIndexes((index) => [
      index("postId"),
      index("parentId"),
      index("createdAt"),
    ])
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
      allow
        .owner()
        .to(["create", "read", "update", "delete"])
        .identityClaim("creatorId"),
    ]),
  PrayerRequest: a
    .model({
      id: a.string().required(),
      creatorId: a.string().required(),
      creator: a.belongsTo("UserProfile", "creatorId"),
      content: a.string().required(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
      viewableUntil: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index("viewableUntil"), index("creatorId")])
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
      allow.owner(),
    ]),
  CompletedChapter: a
    .model({
      id: a.string().required(),
      chapter: a.string().required(),
      userId: a.string().required(),
      user: a.belongsTo("UserProfile", "userId"),
      completedAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index("userId"), index("chapter")])
    .authorization((allow) => [
      allow.authenticated().to(["create", "read"]),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
