import { networkRequests } from './NetworkRequests';
import * as utils from './utils.js';

enum Mode {
    posts = 'posts',
    comments = 'comments',
    comments_edit = 'comments_edit',
}

export default class Profile {
    userName: string = '..loading';
    private comments: Comment[] = [];
    private posts: Post[] = [];
    private modhash: string = '';
    currentComment: any = {
        action: '..loading',
        comment: ''
    };
    mode!: Mode;
    sortIndex: number = 0;
    sort = [
        '?sort=new',
        '?sort=hot',
        '?sort=controversial',
        '?sort=controversial&t=hour',
        '?sort=controversial&t=day',
        '?sort=controversial&t=week',
        '?sort=controversial&t=month',
        '?sort=controversial&t=year',
        '?sort=controversial&t=all',
        '?sort=top',
        '?sort=top&t=hour',
        '?sort=top&t=day',
        '?sort=top&t=week',
        '?sort=top&t=month',
        '?sort=top&t=year',
        '?sort=top&t=all',
    ];

    public async editComments(queryString: string) {
        await this.fetchComments(queryString);
        for (let comment of this.comments) {
            this.currentComment = {
                action: "Editing Comment...",
                comment
            };
            await this.overWriteComment(comment);
            this.currentComment.action = "Performing checks...";
            await utils.resolveAfter7Seconds();
        }
        this.setup();
    }

    public async overwriteAndDelComments(queryString: string) {
        await this.fetchComments(queryString);
        for (let comment of this.comments) {
            this.currentComment = {
                action: "Editing Comment...",
                comment
            };
            await this.overWriteComment(comment);
            if (!comment.isEdited) {
                this.overwriteAndDelComments(queryString);
                break;
            }
            this.currentComment.action = "Deleting Comment...";
            await this.deleteComment(comment);

            if (!comment.isDeleted) {
                this.overwriteAndDelComments(queryString);
                break;
            }
            this.currentComment.action = "Performing checks...";
            await utils.resolveAfter7Seconds();
        }
        this.setup();
    }

    public async setup() {
        await utils.resolveAfter7Seconds();
        if (this.sortIndex >= this.sort.length) {
            this.currentComment.action = `All ${this.mode} deleted!`;
            if(this.mode == Mode.comments_edit){
                this.currentComment.action = `All comments anonymized`;
            }
            this.currentComment.comment = undefined;
            return;
        }
        const r = await networkRequests.getUserDetails();
        this.userName = r.data.name;
        this.modhash = r.data.modhash;

        const urlParams = new URLSearchParams(window.location.search);
        this.mode = urlParams.get('mode') as Mode;
        const curSort = this.sort[this.sortIndex];

        if (this.mode === Mode.posts) {
            this.deletePosts(curSort);
        } else if (this.mode === Mode.comments) {
            this.overwriteAndDelComments(curSort);
        } else if (this.mode === Mode.comments_edit) {
            this.editComments(curSort);
        }
        this.sortIndex++;
    }

    public async fetchComments(queryString: string) {
        this.comments = [];
        const r = await networkRequests.getComments(this.userName, queryString);
        for (let rc of r.data.children) {
            const c = new Comment(rc);
            this.comments.push(c);
        }
    }

    private async overWriteComment(comment: Comment): Promise<any> {
        try {
            const response = await comment.editComment(this.modhash, this.userName);
            comment.isEdited = response.success;
            return response;
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

    private async deleteComment(comment: Comment): Promise<any> {
        try {
            const response = await comment.deleteComment(this.modhash);
            comment.isDeleted = true;
            return response;
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

    private async deletePosts(queryString: string) {
        await this.fetchPosts(queryString);
        for (let p of this.posts) {
            this.currentComment = {
                action: `Deleting Post titled ${p.title}\nposted to the subreddit: ${p.subreddit}`
            };
            await this.deletePost(p);
            this.currentComment.action = `Performing Checks...`;
            if (!p.isDeleted) {
                this.deletePosts(queryString);
                break;
            }
            await utils.resolveAfter7Seconds();
        }
        this.setup();
    }

    public async fetchPosts(queryString: string) {
        this.posts = [];
        const r = await networkRequests.getPosts(this.userName, queryString);
        for (let rp of r.data.children) {
            const p = new Post(rp);
            this.posts.push(p);
        }
    }

    private async deletePost(post: Post): Promise<any> {
        try {
            const r = await post.delete(this.modhash);
            post.isDeleted = true;
            return r;
        } catch (e) {
            utils.onNetworkError(e);
        }
    }

    public getHumanizedSort(sort: string) {
        const params = new URLSearchParams(sort);
        let humanizedSort = '';
        params.forEach((value: string, key: string) => {
            humanizedSort = `${humanizedSort} ${key}: ${value}`;
        });
        return humanizedSort;
    }
}

class Comment {
    private redditThing: any;
    private id: string;
    private thing_id: string;
    private body: string;
    private subreddit: string;
    public editedText: string = utils.generateRandomPhrase();
    public isEdited: boolean = false;
    public isDeleted: boolean = false;

    constructor(redditThing: any) {
        this.redditThing = redditThing;
        this.thing_id = redditThing.data.name;
        this.id = redditThing.data.id;
        this.body = redditThing.data.body;
        this.subreddit = redditThing.data.subreddit;
    }

    public async editComment(uh: string, username: string) {
        const payload = {
            thing_id: this.thing_id,
            text: this.editedText,
            id: `#form-${this.thing_id}`,
            r: this.subreddit,
            uh,
            renderstyle: 'html',
        };
        return await networkRequests.editComment(payload, uh);
    }

    public async deleteComment(uh: string) {
        const payload = {
            id: this.thing_id,
            executed: 'deleted',
            uh,
            renderstyle: 'html'
        };
        return await networkRequests.deleteRedditThing(payload, uh);
    }
}

class Post {
    private thing_id: string;
    public subreddit: string;
    public isDeleted: boolean = false;
    public title: string;

    constructor(private redditThing: any) {
        this.thing_id = this.redditThing.data.name;
        this.subreddit = this.redditThing.data.subreddit;
        this.title = this.redditThing.data.title;
    }

    public async delete(uh: string) {
        const payload = {
            id: this.thing_id,
            executed: 'deleted',
            uh,
            renderstyle: 'html',
        };
        return await networkRequests.deleteRedditThing(payload, uh);
    }
}
