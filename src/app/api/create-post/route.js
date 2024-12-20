import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(request) {
  const { prompt, excerpts, versions = 2, platform = "LinkedIn" } = await request.json();

  // Format excerpts into a readable list
  const excerptsText = excerpts.map((ex, i) => `- ${ex}`).join('\n');

  let finalPrompt = "";

  if (platform === "LinkedIn") {
    finalPrompt = `${prompt}\n\nWrite a LinkedIn-style post following these guidelines:\n\n1. Objective & Audience:\n- Your audience includes professionals, parents, educators, and individuals navigating the digital world.\n- Provide content that resonates emotionally and intellectually, offering valuable insights rather than simply aiming for virality.\n\n2. Source Integration:\n- Seamlessly incorporate several of these excerpts into your post. Each excerpt should retain context and clearly explain its relevance.\n- Elaborate them in a novel and cohesive way using your orignal, unique perspective.\n- Use these excerpts to add credibility, spark thought, and anchor your message in real data or human experiences.\n- Blend them well within the post so that the content stays homogeneous, cohesive, and engaging.\n\n3. Format & Structure:\n- Begin with a compelling statement or statistic to grab attention.\n- Follow with a short anecdote or relatable scenario to humanize the topic.\n- Keep paragraphs short and easily readable.\n\n4. Content & Tone:\n- Inspire readers to think more deeply about their digital behaviors and encourage positive action.\n- Suggest practical steps or considerations.\n- Maintain a conversational, empathetic tone suitable for a professional but relatable platform.\n\n5. Engagement & Interaction:\n- Conclude with a clear call-to-action, such as asking a question or inviting readers to share their own experiences.\n\n6. Hashtags:\n- Add up to five relevant hashtags at the end.\n\nExcerpts:\n${excerptsText}`;
  } else if (platform === "Twitter") {
    finalPrompt = `${prompt}\n\nWrite a Twitter thread following these guidelines:\n\n1. Thread Structure:\n- Begin with a highly engaging tweet that hooks the audience.\n- Use the provided excerpts as the basis for the thread elaborating them in a novel and cohesive way using your orignal, unique perspective.\n- Break down the content into concise, impactful tweets.\n- Use a conversational and relatable tone.\n\n2. Engagement:\n- Include a clear call-to-action in the last tweet.\n- Encourage retweets, replies, or personal reflections.\n\n3. Format:\n- Separate tweets with clear transitions.\n- Add a numbering format for clarity (e.g., "1/5", "2/5").\n\n4. Visuals & Emojis:\n- Suggest where to use emojis sparingly for emphasis.\n\nExcerpts:\n${excerptsText}`;
  }

  const openai = new OpenAI({
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
  });

  // Generate the specified number of versions
  const posts = [];
  for (let i = 0; i < versions; i++) {
    const response = await openai.chat.completions.create({
      model: "o1-preview",
      messages: [{ role: "user", content: finalPrompt }],
    });
    const post = response.choices[0].message.content.trim();
    posts.push(post);
  }

  return NextResponse.json({ posts });
}
