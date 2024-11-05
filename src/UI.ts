import Profile from "./Profile";

export default class UI {
    readonly templateAbsoluteUrl = chrome.runtime.getURL("static_resources/template.html");
    readonly body: HTMLBodyElement = document.getElementsByTagName('body')[0];
    public profile: Profile = new Profile();

    private usernameEl!: HTMLElement | null;
    private actionEl!: HTMLElement | null;
    private sortListEl!: HTMLElement | null;
    private currentActionEl!: HTMLElement | null;
    private commentBodyEl!: HTMLElement | null;
    private editedTextEl!: HTMLElement | null;

    public async injectUI() {
        try {
            const response = await fetch(this.templateAbsoluteUrl);
            if (!response.ok) throw new Error(`Failed to load template: ${response.statusText}`);

            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const appElement: HTMLElement = tempDiv.querySelector('#nrhApp');

            if (appElement) {
                this.body.innerHTML = '';
                this.body.appendChild(appElement);
                this.initializeUIBindings(appElement);
                this.injectStyles();
                this.profile.setup();
            } else {
                console.error("No element with ID 'nrhApp' found in the loaded template.");
            }
        } catch (error) {
            console.error(`Error while trying to inject UI -> ${error}`);
        }
    }

    private initializeUIBindings(appElement: HTMLElement) {
        // Bind elements for dynamic updates
        this.usernameEl = appElement.querySelector('.info-item .profile-username');
        this.actionEl = appElement.querySelector('.info-item .profile-action');
        this.sortListEl = appElement.querySelector('.progress-list');
        this.currentActionEl = appElement.querySelector('.current-action');
        this.commentBodyEl = appElement.querySelector('.comment-box blockquote:nth-of-type(1)');
        this.editedTextEl = appElement.querySelector('.comment-box blockquote:nth-of-type(2)');

        // Null-check and log missing elements
        if (!this.usernameEl) console.warn("usernameEl not found");
        if (!this.actionEl) console.warn("actionEl not found");
        if (!this.sortListEl) console.warn("sortListEl not found");
        if (!this.currentActionEl) console.warn("currentActionEl not found");
        if (!this.commentBodyEl) console.warn("commentBodyEl not found");
        if (!this.editedTextEl) console.warn("editedTextEl not found");

        this.profile.setup();
        // Start the UI update process if all elements are available
        if (this.usernameEl && this.actionEl && this.sortListEl && this.currentActionEl && this.commentBodyEl && this.editedTextEl) {
            setInterval(() => this.updateUI(), 2000);
        } else {
            console.error("Some elements were not found; UI updates are disabled.");
        }
    }

    private updateUI() {
        // Ensure all elements exist before updating
        if (!this.usernameEl || !this.actionEl || !this.sortListEl || !this.currentActionEl || !this.commentBodyEl || !this.editedTextEl) {
            console.error("One or more elements are missing; skipping updateUI.");
            return;
        }

        // Update basic profile info
        this.usernameEl.textContent = this.profile.userName || 'N/A';
        this.actionEl.textContent = this.profile.mode === 'comments_edit'
            ? 'Editing comments'
            : 'Deleting ' + (this.profile.mode || 'N/A');

        // Update sort progress
        this.sortListEl.innerHTML = ''; // Clear existing items
        this.profile.sort.forEach((sort, i) => {
            const li = document.createElement('li');
            li.className = 'progress-item ' + (this.profile.sortIndex >= i ? 'nuke-color' : 'disabled-text');
            li.textContent = this.getHumanizedSort(sort);
            this.sortListEl.appendChild(li);
        });

        // Update current action and comment content
        this.currentActionEl.textContent = this.profile.currentComment.action || 'No Action';
        this.commentBodyEl.textContent = this.profile.currentComment.comment?.body || 'This is where your reddit comments go! They will be edited and/or deleted';
        this.editedTextEl.textContent = this.profile.currentComment.comment?.editedText || 'This is where the updated comment goes! The extension performs an action every 7 seconds to avoid reddit\'s limits.';
    }

    private getHumanizedSort(sort: string) {
        return this.profile.getHumanizedSort(sort);
    }

    private injectStyles() {
        const css = `
        /* Your CSS styles here */
    /* Main body styling */
    body {
        background: linear-gradient(135deg, #1e3a5f, #161b29);
        color: #f1f1f1;
        font-family: 'Roboto', Arial, sans-serif;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }

    /* Header styling */
    h1 {
        font-size: 3rem;
        font-weight: 700;
        color: #ff6b6b;
        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        margin-bottom: 2rem;
        animation: glow 1.5s ease-in-out infinite alternate;
    }

    @keyframes glow {
        from {
            text-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
        }
        to {
            text-shadow: 0 0 16px rgba(255, 107, 107, 1);
        }
    }

    /* Content container styling */
    .content-container {
        display: flex;
        gap: 2rem;
        padding: 2rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
        max-width: 1000px;
        width: 90%;
    }

    /* Column styling */
    .column {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .column-1 {
        flex: 1;
    }

    .column-2 {
        flex: 1.5;
    }

    /* List styling */
    .info-list, .progress-list {
        list-style: none;
        padding: 0;
    }

    .info-item {
        margin-bottom: 1rem;
        font-size: 1.1rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .info-label {
        font-weight: bold;
        color: #ff6b6b;
    }

    .profile-username, .profile-action {
        font-size: 1.1rem;
        color: #c7ecee;
    }

    /* Progress list styling */
    .progress-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .progress-item {
        padding: 0.75rem 1rem;
        background: #2c3e50;
        border-radius: 8px;
        color: #b2bec3;
        font-weight: 500;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .progress-item:hover {
        background: #3d566e;
        color: #ff6b6b;
        transform: translateY(-3px);
    }

    /* Current action */
    .current-action {
        font-size: 1.6rem;
        font-weight: bold;
        color: #ff6b6b;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            color: #ff6b6b;
        }
        50% {
            transform: scale(1.05);
            color: #f78fb3;
        }
    }

    /* Comment box styling */
    .comment-box {
        background: rgba(44, 62, 80, 0.8);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    blockquote {
        font-style: italic;
        font-size: 1.2rem;
        color: #dcdde1;
        padding-left: 1.2rem;
        border-left: 4px solid #ff6b6b;
        margin: 0;
    }

    .to-text {
        font-size: 1rem;
        color: #ff6b6b;
        text-align: center;
        margin: 1rem 0;
    }

    .nuke-color {
        color: #ff6b6b;
    }

    /* Utility classes */
    .text-center {
        text-align: center;
    }

    .m-b-lg {
        margin-bottom: 2rem;
    }
    `;

        const style = document.createElement("style");
        style.type = "text/css";
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }
}
