import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  UserProfile: a
    .model({
      id: a.string().required(),
      userIdentifier: a.string().required(),
      userId: a.string().required(),
      name: a.string(),
      profileImagePath: a.string(),
      points: a.integer(),
      streaks: a.integer(),
      completed: a.string().array(),
      isTestimonyPrivate: a.boolean(),
      testimony: a.string(),
      prayerRequests: a.hasMany("PrayerRequest", "creatorId"),
      comments: a.hasMany("Comment", "creatorId"),
      completedChapters: a.hasMany("CompletedChapter", "userId"),
      sentFriendRequests: a.hasMany("Friendship", "requesterId"),
      receivedFriendRequests: a.hasMany("Friendship", "addresseeId"),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index("userId"), index("userIdentifier")])
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["create", "read"]),
    ]),
  Friendship: a
    .model({
      id: a.string().required(),
      requesterId: a.string().required(),
      addresseeId: a.string().required(),
      requester: a.belongsTo("UserProfile", "requesterId"),
      addressee: a.belongsTo("UserProfile", "addresseeId"),
      status: a.enum(["pending", "accepted", "declined", "blocked"]),
      // Additional features
      friendshipDate: a.datetime(), // When friendship was accepted
      sharedStreaks: a.integer().default(0), // Shared reading streaks
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [
      index("requesterId"),
      index("addresseeId"),
      index("status"),
      index("friendshipDate"),
    ])
    .authorization((allow) => [allow.authenticated()]),
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
      allow.owner().identityClaim("creatorId"),
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
  DailyChapter: a
    .model({
      id: a.string().required(),
      date: a.date().required(), // Format: "2024-08-20"
      bookName: a.string().required(), // "創世記", "出エジプト記", etc.
      chapterNumber: a.integer().required(),
      title: a.string(),
      description: a.string(),
      createdAt: a.datetime().required(),
      updatedAt: a.datetime().required(),
    })
    .secondaryIndexes((index) => [index("date")])
    .authorization((allow) => [
      allow.authenticated().to(["read"]), // Everyone can read
      allow.groups(["admin"]).to(["create", "update", "delete"]), // Only admins can manage
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
