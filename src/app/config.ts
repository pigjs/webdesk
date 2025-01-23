export interface IConfig {
    github: {
        auth: string;
        owner: string;
        repo: string;
    }
}

export const config: IConfig = {
    github: {
        auth: process.env.GITHUB_AUTH as string,
        owner: process.env.GITHUB_OWNER as string,
        repo: process.env.GITHUB_REPO as string
    }
}