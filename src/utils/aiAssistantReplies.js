/** Pure helpers that derive the AI assistant's reply-card lists from the reply generator response. */

export function deriveAIAssistantReplies(replyData) {
    const rewrites = replyData?.rewrites
        ? [
              replyData.rewrites.clean,
              replyData.rewrites.short,
              replyData.rewrites.warm,
              replyData.rewrites.confident,
          ].filter(Boolean)
        : [];
    const emojiRepliesWith = replyData?.emoji_replies_with_emojis?.length
        ? replyData.emoji_replies_with_emojis
        : replyData?.emoji_replies || [];
    const emojiRepliesWithout = replyData?.emoji_replies_without_emojis?.length
        ? replyData.emoji_replies_without_emojis
        : replyData?.emoji_replies || [];
    const groupedReplies = replyData?.grouped_replies
        ? [
              { label: "Top Reply", value: replyData.grouped_replies.top_reply },
              {
                  label: "Safe",
                  value:
                      replyData.grouped_replies.safe_reply ||
                      replyData.grouped_replies.opener ||
                      replyData.grouped_replies.short_reply,
              },
              { label: "Warm", value: replyData.grouped_replies.warm_reply },
              {
                  label: "Playful",
                  value: replyData.grouped_replies.playful_reply || replyData.grouped_replies.follow_up,
              },
              {
                  label: "Curious",
                  value: replyData.grouped_replies.curious_reply || replyData.grouped_replies.follow_up,
              },
              {
                  label: "Direct",
                  value: replyData.grouped_replies.direct_reply || replyData.grouped_replies.confident_reply,
              },
          ].filter((item) => item.value)
        : [];
    const aiUnderstandingParagraph = [
        replyData?.conversation_summary,
        replyData?.context_focus,
        replyData?.detected_intent
            ? `The main intent looks like ${String(replyData.detected_intent).replaceAll("_", " ")}.`
            : "",
    ]
        .filter(Boolean)
        .join(" ");

    return { rewrites, emojiRepliesWith, emojiRepliesWithout, groupedReplies, aiUnderstandingParagraph };
}
