import React from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    YAxis,
    Legend,
} from "recharts";

import { CommitStatus, GitLogStats, DeveloperInfos } from "../struct";

type ResultObject = {
    [key: string]: any;
};

function getData(
    data: CommitStatus,
    developers: Map<string, DeveloperInfos>
): ResultObject[] {
    if (developers) {
        const result = data.reduce<ResultObject[]>(
            (accumulator, currentObject) => {
                const author = currentObject.author_name;
                const year = currentObject.year;
                const month = currentObject.month;

                const existingObject = accumulator.find(
                    (entry) =>
                        entry["year"] === currentObject.year &&
                        entry["month"] === currentObject.month
                );

                if (existingObject !== undefined) {
                    // If an entry already exists for the date, update the author's value
                    if (
                        existingObject[author] !==
                        undefined /*&& typeof existingObject[author] === "number"*/
                    ) {
                        existingObject[author] += 1;
                    }
                } else {
                    const newObject: {
                        [key: string]: any;
                    } = {
                        year: year,
                        month: month,
                        title: year.toString() + "-" + month.toString(),
                    };

                    for (let key of Object.keys(developers)) {
                        if (key === author) {
                            newObject[key] = 1;
                        } else {
                            newObject[key] = 0;
                        }
                    }
                    accumulator.push(newObject);
                }

                return accumulator;
            },
            []
        );

        const sortedArray = Array.from(result);
        sortedArray.sort(
            (a, b) => (a.year - b.year) * 12 + (a.month - b.month)
        );

        return sortedArray;
    }

    return [];
}

function getActiveDevelopers30InDay(data: CommitStatus): number {
    let date30Ago = new Date();
    date30Ago.setDate(date30Ago.getDate() - 30);

    const filteredData = data.filter((item) => {
        let date = new Date(item.year, item.month, item.month);
        return date.getTime() >= date30Ago.getTime();
    });

    const authors = new Set<string>();

    filteredData.forEach((item) => {
        authors.add(item.author_name);
    });

    return authors.size;
}

function getCommitsIn30Day(data: CommitStatus): number {
    let date30Ago = new Date();
    date30Ago.setDate(date30Ago.getDate() - 30);

    const filteredData = data.filter((item) => {
        let date = new Date(item.year, item.month, item.month);
        return date.getTime() >= date30Ago.getTime();
    });

    return filteredData.length;
}

function getAdditionIn30Day(data: CommitStatus): number {
    let date30Ago = new Date();
    date30Ago.setDate(date30Ago.getDate() - 30);

    const filteredData = data.filter((item) => {
        let date = new Date(item.year, item.month, item.month);
        return date.getTime() >= date30Ago.getTime();
    });

    const total: number = filteredData.reduce((accumulator, item) => {
        return accumulator + item.num_added_lines;
    }, 0);

    return total;
}

function getDeletionIn30Day(data: CommitStatus): number {
    let date30Ago = new Date();
    date30Ago.setDate(date30Ago.getDate() - 30);

    const filteredData = data.filter((item) => {
        let date = new Date(item.year, item.month, item.month);
        return date.getTime() >= date30Ago.getTime();
    });

    const total: number = filteredData.reduce((accumulator, item) => {
        return accumulator + item.num_deleted_lines;
    }, 0);

    return total;
}

function sortedTop5Developers(
    data: Map<string, DeveloperInfos>
): DeveloperInfos[] {
    if (data) {
        const sortedArray = Array.from(Object.values(data));
        sortedArray.sort(
            (a: DeveloperInfos, b: DeveloperInfos) =>
                b.number_of_commits - a.number_of_commits
        );

        if (sortedArray.length > 5) {
            return sortedArray.slice(0, 5);
        } else {
            return sortedArray;
        }
    }

    return [];
}

const color_array = [
    "#222f3e",
    "#8395a7",
    "#341f97",
    "#2e86de",
    "#01a3a4",
    "#10ac84",
    "#0abde3",
    "#ee5253",
    "#ff9f43",
    "#f368e0",
];

interface IOverviewPageProp {
    commit_status: CommitStatus;
    git_log_stats: GitLogStats;
}

export default class OverviewPage extends React.Component<IOverviewPageProp> {
    constructor(props: IOverviewPageProp) {
        super(props);
    }

    componentWillUnmount() {
        console.log("OverviewPage WILL UNMOUNT!");
    }

    componentDidUpdate(prevProps: IOverviewPageProp) {
        console.log("OverviewPage  componentDidUpdate!");
        // console.log(this.props.git_log_stats.developer_infos)
        // let v = this.props.git_log_stats.developer_infos as Map<string, DeveloperInfos>;
    }

    public render() {
        return (
            <>
                <div className="grid grid-cols-12 gap-4">
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-md font-medium">
                                Total Commits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {" "}
                                {this.props.git_log_stats
                                    .number_of_tatal_commits
                                    ? this.props.git_log_stats.number_of_tatal_commits.toLocaleString()
                                    : "--"}{" "}
                                commits.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getCommitsIn30Day(
                                    this.props.commit_status
                                ).toLocaleString()}{" "}
                                commits in the past 30 days.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-md font-medium">
                                Developers
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {this.props.git_log_stats.developer_infos
                                    ? Object.keys(
                                          this.props.git_log_stats
                                              .developer_infos
                                      ).length.toLocaleString()
                                    : "--"}{" "}
                                developers.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getActiveDevelopers30InDay(
                                    this.props.commit_status
                                )}{" "}
                                active developers in the past 30 days.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-md font-medium">
                                Additions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +
                                {this.props.git_log_stats
                                    .number_of_tatal_additions
                                    ? this.props.git_log_stats.number_of_tatal_additions.toLocaleString()
                                    : "--"}{" "}
                                lines.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getAdditionIn30Day(
                                    this.props.commit_status
                                ).toLocaleString()}{" "}
                                lines are added in the past 30 days.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-md font-medium">
                                Deletions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                -
                                {this.props.git_log_stats
                                    .number_of_tatal_deletions
                                    ? this.props.git_log_stats.number_of_tatal_deletions.toLocaleString()
                                    : "--"}{" "}
                                lines.
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getDeletionIn30Day(
                                    this.props.commit_status
                                ).toLocaleString()}{" "}
                                lines are deleted in the past 30 days.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="col-span-8">
                        <CardHeader>
                            <CardTitle className="text-md font-medium">
                                OverviewPage
                            </CardTitle>
                            <CardDescription>
                                Contributions OverviewPage in repository.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" minHeight={400}>
                                <BarChart
                                    data={getData(
                                        this.props.commit_status,
                                        this.props.git_log_stats.developer_infos
                                    )}
                                    margin={{
                                        top: 0,
                                        right: 0,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="title"
                                        domain={["dataMin", "dataMax"]}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    {this.props.git_log_stats.developer_infos &&
                                        Object.keys(
                                            this.props.git_log_stats
                                                .developer_infos
                                        ).map((author, index) => {
                                            let color_index = index;
                                            while (
                                                color_index >=
                                                color_array.length
                                            ) {
                                                color_index -=
                                                    color_array.length;
                                            }

                                            return (
                                                <Bar
                                                    key={author}
                                                    dataKey={author}
                                                    stackId="a"
                                                    fill={
                                                        color_array[color_index]
                                                    }
                                                />
                                            );
                                        })}
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle className="text-md font-medium">
                                Top 5 Developers
                            </CardTitle>
                            <CardDescription>
                                Leading contributors in repository.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {sortedTop5Developers(
                                this.props.git_log_stats.developer_infos
                            ).map((info) => {
                                return (
                                    <div className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-md font-medium leading-none">
                                                {info.name}
                                            </p>
                                            <p className="text-md text-muted-foreground">
                                                {info.email}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            +
                                            {info.number_of_commits.toLocaleString()}{" "}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }
}
