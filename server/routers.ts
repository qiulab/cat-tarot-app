import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { READER_CHARACTERS, SPREAD_TYPES, TAROT_CARDS } from "@shared/tarotData";
import { getSessionCookieOptions } from "./_core/cookies";
// Groq Llama 3.3 70B used directly via fetch
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { readings } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tarot: router({
    // Get all cards
    getCards: publicProcedure.query(() => {
      return TAROT_CARDS;
    }),

    // Get reader characters
    getReaders: publicProcedure.query(() => {
      return READER_CHARACTERS;
    }),

    // Get spread types
    getSpreads: publicProcedure.query(() => {
      return Object.values(SPREAD_TYPES);
    }),

    // Generate a reading interpretation via LLM
    generateReading: publicProcedure
      .input(
        z.object({
          spreadType: z.enum(["three-card", "celtic-cross", "yes-no"]),
          readerCharacterId: z.string(),
          question: z.string().optional(),
          drawnCards: z.array(
            z.object({
              cardId: z.string(),
              position: z.string(),
              isReversed: z.boolean(),
            })
          ),
          sessionId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const reader = READER_CHARACTERS.find(r => r.id === input.readerCharacterId);
        if (!reader) throw new Error("Reader character not found");

        const spread = SPREAD_TYPES[input.spreadType];
        if (!spread) throw new Error("Spread type not found");

        // Build card context for the LLM
        const cardDetails = input.drawnCards.map(dc => {
          const card = TAROT_CARDS.find(c => c.id === dc.cardId);
          if (!card) return null;
          return {
            card,
            position: dc.position,
            isReversed: dc.isReversed,
            meaning: dc.isReversed ? card.reversedMeaning : card.uprightMeaning,
          };
        }).filter(Boolean);

        const cardDescriptions = cardDetails.map(cd => {
          if (!cd) return "";
          return `Position: "${cd.position}" — ${cd.card.name} (${cd.isReversed ? "REVERSED" : "UPRIGHT"})\nMeaning: ${cd.meaning}\nKeywords: ${cd.card.keywords.join(", ")}`;
        }).join("\n\n");

        const spreadName = spread.name;
        const question = input.question ? `The seeker's question: "${input.question}"` : "The seeker has not asked a specific question — provide a general reading.";

        const userPrompt = `You are performing a ${spreadName} tarot reading.

${question}

The cards drawn are:
${cardDescriptions}

${input.spreadType === "yes-no" ? `For this Yes/No reading, begin by clearly stating "YES" or "NO" based on the card's energy, then explain the nuance.` : ""}

Please provide a rich, personalized reading that weaves together all the cards in their positions, addressing the seeker's question or situation. Speak directly to the seeker in second person ("you").

At the very end, always include a section titled "**One Action to Take This Week**" with a single, concrete, practical action the seeker can take in the next 7 days based on the reading. Make it specific and actionable, not vague.`;

        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) throw new Error("GROQ_API_KEY not set");

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: reader.systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 1024,
            temperature: 0.85,
          }),
        });

        if (!groqRes.ok) {
          const errText = await groqRes.text();
          throw new Error(`Groq API error: ${groqRes.status} ${errText}`);
        }

        const groqData = await groqRes.json() as { choices: Array<{ message: { content: string } }> };
        const interpretation = groqData.choices[0]?.message?.content ?? "The cards have no message at this time.";

        // Save reading to database
        const db = await getDb();
        if (db) {
          try {
            await db.insert(readings).values({
              sessionId: input.sessionId,
              spreadType: input.spreadType,
              readerCharacterId: input.readerCharacterId,
              question: input.question ?? null,
              cards: input.drawnCards,
              interpretation: typeof interpretation === "string" ? interpretation : String(interpretation),
            });
          } catch (err) {
            console.error("Failed to save reading:", err);
          }
        }

        return { interpretation };
      }),

    // Get reading history for a session
    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        try {
          const results = await db
            .select()
            .from(readings)
            .where(eq(readings.sessionId, input.sessionId))
            .orderBy(desc(readings.createdAt))
            .limit(20);
          return results;
        } catch {
          return [];
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
