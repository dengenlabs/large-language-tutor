import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import logger from '../logger.js';
import { IConversation } from '../models/conversation.js';
import { findPreviousMessages } from '../models/message.js';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});

export function requestChatCompletion(messages: OpenAI.Chat.ChatCompletionMessage[], stream = false) {

    console.log(messages, "Requestion chat completion")

    return openai.chat.completions.create({
        stream: stream,
        model: "gpt-4",
        messages: messages,
        temperature: 0.5,
        n: 1,
        max_tokens: 2048,
    });
}

/** Abstract class defining the base methods of a prompt
 * Implement and extend this class to create Prompt that can be used to
 * Generate Prompts for use case and LLMs.
 * Type properly the constructor to force passing the right arguments
 */
export abstract class Prompt<T extends Prompt<T>> {

    studyLanguage: string;
    userLanguage: string;
    userInterests?: string[];
    //TODO the conversation has a user reference sop we can fetch the user info with a populate
    userAge?: number;
    userLevel?: string;
    conversation: IConversation;

    constructor(conversation: IConversation) {
        this.conversation = conversation;
        this.studyLanguage = conversation.study_language;
        this.userLanguage = conversation.user_language;
    }

    abstract buildMessages(): Promise<OpenAI.Chat.ChatCompletionMessage[]>;

    async execute(): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        const messages = await this.buildMessages();
        const result = await requestChatCompletion(messages, false) as OpenAI.Chat.Completions.ChatCompletion;
        return result;
    }

}

export class ChatCompletion extends Prompt<ChatCompletion> {

    constructor(conversation: IConversation) {
        super(conversation);
        this.userLevel = "JPLT4";

    }

    async buildMessages(limit = 50): Promise<OpenAI.Chat.ChatCompletionMessage[]> {
        let sysMsg = `
        You are a language tutor. The user is learning ${this.studyLanguage} and is speaking ${this.userLanguage}.
        You are chatting with this user to help him/her practice and learn ${this.studyLanguage}.
        Always make sure your messages are engaging and helpful.
        `;

        if (this.userLevel) {
            sysMsg = sysMsg + `The user is at level ${this.userLevel} in ${this.studyLanguage}. Please only use words and structure that should be accessible for this level in the language.`;
        }

        if (this.userAge) {
            sysMsg = sysMsg + `The user is ${this.userAge} years old. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        if (this.userInterests) {
            sysMsg = sysMsg + `The user is interested in ${this.userInterests.join(",")}. Please use a language appropriate for that age and make sure topics are relevant.`;
        }

        const latestMessages = await findPreviousMessages(this.conversation._id, limit);
        const messages: OpenAI.Chat.ChatCompletionMessage[] = [];
        messages.push({
            role: "system",
            content: sysMsg,
        })

        for (let i = latestMessages.length - 1; i >= 0; i--) {
            const m = latestMessages[i];
            messages.push({ role: m.origin, content: m.content });
        }

        return messages;
    }

    async execute(limit = 50): Promise<OpenAI.Chat.Completions.ChatCompletion> {
        const messages = await this.buildMessages(limit);
        logger.log(messages, "Executing a new chat Request");
        return await requestChatCompletion(messages, false) as OpenAI.Chat.Completions.ChatCompletion;
    }

    async stream(limit = 50): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        const messages = await this.buildMessages(limit);
        logger.log(messages, "Executing a new chat Request in stream mode");
        return requestChatCompletion(messages, true) as Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>>;
    }

}