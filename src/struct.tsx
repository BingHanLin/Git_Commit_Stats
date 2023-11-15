export type OneCommitStatus = {
    author_name: string;
    author_email: string;
    num_added_lines: number;
    num_deleted_lines: number;
    time_stamp: string;
    message: string;
    hash: string;
    weekday: string;
    month: number;
    date: number;
    year: number;
};

export type CommitStatus = OneCommitStatus[];

export type DeveloperInfos = {
    number_of_commits: number;
    email: string;
    name: string;
};

export type DeveloperInfoDict = Map<string, DeveloperInfos>;

export type GitLogStats = {
    number_of_tatal_commits: number;
    number_of_tatal_additions: number;
    number_of_tatal_deletions: number;
    developer_infos: Map<string, DeveloperInfos>;
};
