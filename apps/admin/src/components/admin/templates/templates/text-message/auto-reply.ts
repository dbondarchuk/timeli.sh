export const autoReplyTextMessageTemplate = {
  name: "Text message auto reply",
  value:
    "Hi{{#fields.name}} {{.}}{{/fields.name}},\nThis is an unmonitored phone number. Please send your reply to {{config.phone}}.\n\nThanks,\n{{config.name}} ",
};
