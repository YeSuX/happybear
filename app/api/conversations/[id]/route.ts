import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/chat-schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        messages: {
          orderBy: [asc(messages.createdAt)],
        },
      },
    });

    if (!conversation) {
      return new Response("Not Found", { status: 404 });
    }

    if (conversation.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("Conversation GET error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const { id: conversationId } = await params;

    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation) {
      return new Response("Not Found", { status: 404 });
    }

    if (conversation.userId !== userId) {
      return new Response("Forbidden", { status: 403 });
    }

    await db.delete(conversations).where(eq(conversations.id, conversationId));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Conversation DELETE error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
