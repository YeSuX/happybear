import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/chat-schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: [desc(conversations.updatedAt)],
    });

    return Response.json(userConversations);
  } catch (error) {
    console.error("Conversations API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
