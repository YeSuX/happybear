import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/chat-schema";
import { eq, asc } from "drizzle-orm";
import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";

function generateTitle(content: string): string {
  const maxLength = 30;
  const cleaned = content.trim().replace(/\n/g, " ");
  return cleaned.length > maxLength
    ? cleaned.slice(0, maxLength) + "..."
    : cleaned;
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const { prompt, conversationId } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response("Invalid request body", { status: 400 });
    }

    let currentConversationId = conversationId;

    if (!currentConversationId) {
      const [newConversation] = await db
        .insert(conversations)
        .values({
          userId,
          title: generateTitle(prompt),
        })
        .returning();
      currentConversationId = newConversation.id;
    } else {
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, currentConversationId),
      });

      if (!conversation || conversation.userId !== userId) {
        return new Response("Forbidden", { status: 403 });
      }
    }

    const agent = new Agent({
      initialState: {
        systemPrompt: "你是一个友好、专业的 AI 助手。请用简洁、准确的语言回答用户问题。",
        model: getModel("openai", "gpt-4o-mini"),
      },
    });

    await db.insert(messages).values({
      conversationId: currentConversationId,
      role: "user",
      content: prompt,
    });

    const encoder = new TextEncoder();
    let fullContent = "";

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          agent.subscribe((event) => {
            if (
              event.type === "message_update" &&
              event.assistantMessageEvent.type === "text_delta"
            ) {
              const delta = event.assistantMessageEvent.delta;
              fullContent += delta;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`)
              );
            }
          });

          await agent.prompt(prompt);

          await db.insert(messages).values({
            conversationId: currentConversationId!,
            role: "assistant",
            content: fullContent,
          });

          await db
            .update(conversations)
            .set({ updatedAt: new Date() })
            .where(eq(conversations.id, currentConversationId!));

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Agent error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": currentConversationId,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
