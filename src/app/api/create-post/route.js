import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(request) {
  const { prompt, excerpts } = await request.json();

  // Join excerpts into a formatted string:
  const excerptsText = excerpts.map((ex, i) => `- ${ex}`).join('\n');
  const finalPrompt = `${prompt}\n.
    Write a LinkedIn-style post and follow these guidelines:

    1. Objective & Audience:
    - Your audience includes professionals, parents, educators, and individuals navigating the digital world.
    - Provide content that resonates emotionally and intellectually, offering valuable insights rather than simply aiming for virality.

    2. Source Integration:
    - You are given a set of pre-selected excerpts at the end of this prompt.
    - Seamlessly incorporate several of these excerpts into your post. Each excerpt should retain context and clearly explain its relevance.
    - You may paraphrase the excerpts but maintain their core meaning.
    - Use these excerpts to add credibility, spark thought, and anchor your message in real data or human experiences.
    - Blend them well within the post so that the content stays homogeneous, cohesive and engaging.

    3. Format & Structure:
    - Begin with a compelling statement or statistic to grab attention.
    - Follow with a short anecdote or relatable scenario to humanize the topic.
    - Keep paragraphs short and easily readable.
    - Use emojis sparingly to highlight key points or add warmth.

    4. Content & Tone:
    - Inspire readers to think more deeply about their digital behaviors and encourage positive action.
    - Suggest practical steps or considerations (e.g., encouraging open dialogue, setting guidelines, or being mindful of online interactions).
    - Maintain a conversational, empathetic tone suitable for a professional but relatable platform.

    5. Engagement & Interaction:
    - Conclude with a clear call-to-action, such as asking a question or inviting readers to share their own experiences.
    - Mention that if additional resources or links are available, they will be placed in the comments (do not include external links directly).
    - Given the overall post, elaborate the most attention-grabbing headline and put it on top of the post to get the readers curious to expand the content and read more.

    6. Hashtags:
    - Add up to five relevant hashtags at the end (e.g., #DigitalWellbeing, #OnlineSafety, #TechEthics, #MentalHealth, #ConsciousTech).
    Use these guidelines to craft a well-structured, resonant LinkedIn post that integrates the information from ${excerptsText} naturally and encourages reader engagement.`;

  const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
  });

  // Call GPT twice with the same prompt or slightly varied instructions
  const response1 = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: finalPrompt }],
  });
  const post1 = response1.choices[0].message.content.trim();

  const response2 = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: finalPrompt }],
  });
  const post2 = response2.choices[0].message.content.trim();
  console.log(post1, post2)

  return NextResponse.json({ posts: [post1, post2] });
}
