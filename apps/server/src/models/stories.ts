import type { ObjectId as ObjectIdType } from 'mongoose';
import mongoose from 'mongoose';
import { IUser } from './user.js';

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;


export interface IStory {
    readonly id: string,
    readonly _id: ObjectIdType,
    created: Date,
    content: string,
    questions?: string[],
    topic?: string,
    user?: string | ObjectIdType | IUser,
}

export const StorySchema = new mongoose.Schema<IStory>({
    topic: { type: String, required: false, index: false },
    created: { type: Date, index: true },
    user: { type: ObjectId, ref: 'User', required: false, index: true },
    content: String,
}, {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
});

StorySchema.virtual('id').get(function (this: mongoose.Document) {
    return this._id.toString();
});

export type StoryDocument = mongoose.Document<ObjectIdType, any, IStory> & IStory;

export const Story = mongoose.model<StoryDocument>('Story', StorySchema);