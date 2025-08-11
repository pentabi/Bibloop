import { generateClient } from "aws-amplify/data";
import { Schema } from "../../backend/amplify/data/resource";

// Generate the client with proper typing
export const client = generateClient<Schema>({
  authMode: "userPool",
});
