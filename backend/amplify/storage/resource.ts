import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "BibloopStorage",
  access: (allow) => ({
    "public/*": [
      allow.guest.to(["read"]),
      allow.entity("identity").to(["read", "write", "delete"]),
    ],
  }),
});
