import React from "react";

import { useSelector, useDispatch } from "react-redux";

import { setInterval, setDeveloper, setDateRange } from "./slice";

import type { RootState } from "./store";
import { connect } from "react-redux";

import { DateRange } from "react-day-picker";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Combobox } from "./dashboard/components/combobox";
import { CalendarDateRangePicker } from "./dashboard/components/date-range-picker";

import {
    LineChart,
    XAxis,
    Tooltip,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    YAxis,
    Legend,
    ReferenceLine,
} from "recharts";

import { OneCommitStatus, CommitStatus, GitLogStats } from "./struct";

function convertIntoDateRange(
    date_range: [number | null, number | null]
): DateRange {
    if (date_range) {
        if (date_range[0] === null && date_range[0] === null) {
            let date1 = new Date();
            date1.setMonth(date1.getMonth() - 6);
            if (date_range[0] !== null) {
                date1.setTime(date_range[0]);
            }

            let date2 = new Date();
            if (date_range[1] !== null) {
                date2.setTime(date_range[1]);
            }
            return { from: date1, to: date2 };
        } else {
            let date1 = undefined;
            if (date_range[0] !== null) {
                date1 = new Date();
                date1.setTime(date_range[0]);
            }

            let date2 = undefined;
            if (date_range[1] !== null) {
                date2 = new Date();
                date2.setTime(date_range[1]);
            }
            return { from: date1, to: date2 };
        }
    }

    return { from: undefined, to: undefined };
}

type ResultObjectType = {
    year: number;
    month: number;
    date: number;
    title: string;
    num_added_lines: number;
    num_deleted_lines: number;
    num_commits: number;
};

function getData(
    data: CommitStatus,
    interval: string,
    developer: string,
    date_range: [number | null, number | null]
): ResultObjectType[] {
    const authorFilteredData = data.filter(
        (item) => item.author_name === developer
    );

    const dateRnageFilteredData = authorFilteredData.filter((item) => {
        // January is month 0. December is month 11.
        const item_date = new Date(
            item.year,
            item.month - 1,
            item.date
        ).getTime();

        if (date_range) {
            if (date_range[0] !== null && date_range[1] !== null) {
                return date_range[0] <= item_date && item_date <= date_range[1];
            } else if (date_range[0] !== null) {
                return date_range[0] <= item_date;
            } else if (date_range[1] !== null) {
                return item_date <= date_range[1];
            }
        }
        return false;
    });

    const reducedData = dateRnageFilteredData.reduce<ResultObjectType[]>(
        (accumulator, currentObject) => {
            const year = currentObject.year;
            const month = currentObject.month;
            const date = currentObject.date;

            if (interval === "month") {
                const existingObject = accumulator.find(
                    (entry) =>
                        entry["year"] === currentObject.year &&
                        entry["month"] === currentObject.month
                );

                if (existingObject !== undefined) {
                    existingObject.num_added_lines +=
                        currentObject.num_added_lines;
                    existingObject.num_deleted_lines +=
                        currentObject.num_deleted_lines;
                    existingObject.num_commits += 1;
                } else {
                    const newObject = {
                        year: year,
                        month: month,
                        date: 1,
                        title: year.toString() + "-" + month.toString(),
                        num_added_lines: currentObject.num_added_lines,
                        num_deleted_lines: currentObject.num_deleted_lines,
                        num_commits: 1,
                    };
                    accumulator.push(newObject);
                }
            } else {
                const existingObject = accumulator.find(
                    (entry) =>
                        entry["year"] === currentObject.year &&
                        entry["month"] === currentObject.month &&
                        entry["date"] === currentObject.date
                );

                if (existingObject !== undefined) {
                    existingObject["num_added_lines"] +=
                        currentObject.num_added_lines;
                    existingObject["num_deleted_lines"] +=
                        currentObject.num_deleted_lines;
                    existingObject["num_commits"] += 1;
                } else {
                    const newObject = {
                        year: year,
                        month: month,
                        date: date,
                        title:
                            year.toString() +
                            "-" +
                            month.toString() +
                            "-" +
                            date.toString(),
                        num_added_lines: currentObject.num_added_lines,
                        num_deleted_lines: currentObject.num_deleted_lines,
                        num_commits: 1,
                    };
                    accumulator.push(newObject);
                }
            }

            return accumulator;
        },
        []
    );

    reducedData.sort(
        (a, b) =>
            new Date(a.year, a.month - 1, a.date).getTime() -
            new Date(b.year, b.month - 1, b.date).getTime()
    );

    return reducedData;
}

function averageCommits(
    data: CommitStatus,
    interval: string,
    developer: string,
    date_range: [number | null, number | null]
): number {
    const result = getData(data, interval, developer, date_range);

    if (result.length == 0) {
        return 0.0;
    }

    const sum = result.reduce((acc, obj) => acc + obj.num_commits, 0);
    const average = sum / result.length;
    return average;
}

function averageAdditions(
    data: CommitStatus,
    interval: string,
    developer: string,
    date_range: [number | null, number | null]
): number {
    const result = getData(data, interval, developer, date_range);

    if (result.length == 0) {
        return 0.0;
    }

    const sum = result.reduce((acc, obj) => acc + obj.num_added_lines, 0);
    const average = sum / result.length;
    return average;
}

function averageDeletions(
    data: CommitStatus,
    interval: string,
    developer: string,
    date_range: [number | null, number | null]
): number {
    const result = getData(data, interval, developer, date_range);

    if (result.length == 0) {
        return 0.0;
    }

    const sum = result.reduce((acc, obj) => acc + obj.num_deleted_lines, 0);
    const average = sum / result.length;
    return average;
}

const intervals = [
    { value: "month", label: "Month" },
    { value: "date", label: "Date" },
];

interface ILineChartViewProp {
    commit_status: CommitStatus;
    git_log_stats: GitLogStats;
    interval: string;
    developer: string;
    date_range: [number | null, number | null];
    setInterval: (val: string) => void;
    setDeveloper: (val: string) => void;
    setDateRange: (val: [number | null, number | null]) => void;
}

export const CustomizedAxisTick = ({
    x,
    y,
    payload,
    rotateAngle = -45,
}: {
    x?: number;
    y?: number;
    payload?: any;
    rotateAngle?: number;
}) => {
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={16}
                textAnchor="end"
                fill="#666"
                transform={`rotate(${rotateAngle})`}
            >
                {payload.value}
            </text>
        </g>
    );
};

class LineChartView extends React.Component<ILineChartViewProp> {
    constructor(props: ILineChartViewProp) {
        super(props);
    }

    componentWillUnmount() {
        console.log("LineChartView WILL UNMOUNT!");
    }

    componentDidMount() {
        console.log("LineChartViewcomponentDidMount!");
        if (
            this.props.git_log_stats &&
            this.props.git_log_stats.developer_infos
        ) {
            const developers = Array.from(
                Object.keys(this.props.git_log_stats.developer_infos)
            );
            const first_developer: string =
                developers.length > 0 ? developers[0] : "";

            const developer: string = developers.includes(this.props.developer)
                ? this.props.developer
                : first_developer;
            this.props.setDeveloper(developer);
        }

        if (this.props.interval.length === 0) {
            this.props.setInterval(intervals[0].value);
        }

        if (
            this.props.date_range[0] === null &&
            this.props.date_range[1] === null
        ) {
            let date1 = new Date();
            date1.setMonth(date1.getMonth() - 6);

            let date2 = new Date();

            this.props.setDateRange([date1.getTime(), date2.getTime()]);
        }
    }

    componentDidUpdate(prevProps: ILineChartViewProp) {
        console.log("LineChartView componentDidUpdate!");

        if (
            this.props.git_log_stats &&
            this.props.git_log_stats.developer_infos
        ) {
            const developers = Array.from(
                Object.keys(this.props.git_log_stats.developer_infos)
            );
            const first_developer: string =
                developers.length > 0 ? developers[0] : "";

            const developer: string = developers.includes(this.props.developer)
                ? this.props.developer
                : first_developer;

            this.props.setDeveloper(developer);
        }

        if (this.props.interval.length === 0) {
            this.props.setInterval(intervals[0].value);
        }

        if (
            this.props.date_range[0] === null &&
            this.props.date_range[1] === null
        ) {
            let date1 = new Date();
            date1.setMonth(date1.getMonth() - 6);

            let date2 = new Date();

            this.props.setDateRange([date1.getTime(), date2.getTime()]);
        }

        console.log("LineChartView componentDidUpdate!...");
    }

    public render() {
        return (
            <>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-start-1 col-end-13">
                        <div className="flex justify-end space-x-2 ">
                            <Combobox
                                value={this.props.interval}
                                data={intervals}
                                placeholder="Select Interval"
                                onSelected={(interval: string) => {
                                    this.props.setInterval(interval);
                                }}
                            ></Combobox>
                            <Combobox
                                value={this.props.developer}
                                data={
                                    this.props.git_log_stats.developer_infos
                                        ? Object.keys(
                                              this.props.git_log_stats
                                                  .developer_infos
                                          ).map((e) => {
                                              return {
                                                  value: e,
                                                  label: e,
                                              };
                                          })
                                        : []
                                }
                                placeholder="Select Developer"
                                onSelected={(developer: string) => {
                                    this.props.setDeveloper(developer);
                                }}
                            ></Combobox>
                            <CalendarDateRangePicker
                                value={convertIntoDateRange(
                                    this.props.date_range
                                )}
                                onSelected={(
                                    data_range: DateRange | undefined
                                ) => {
                                    if (data_range) {
                                        let number_date_range: [
                                            number | null,
                                            number | null
                                        ] = [null, null];

                                        if (data_range.from !== undefined) {
                                            number_date_range[0] =
                                                data_range.from.getTime();
                                        } else {
                                            number_date_range[0] = null;
                                        }

                                        if (data_range.to !== undefined) {
                                            number_date_range[1] =
                                                data_range.to.getTime();
                                        } else {
                                            number_date_range[1] = null;
                                        }

                                        this.props.setDateRange(
                                            number_date_range
                                        );
                                    }
                                }}
                            ></CalendarDateRangePicker>
                        </div>
                    </div>
                    <div className="col-start-1 col-end-13">
                        <Tabs defaultValue="commits">
                            <TabsList>
                                <TabsTrigger value="commits">
                                    Commits
                                </TabsTrigger>
                                <TabsTrigger value="addition&deletion">
                                    Addition & Deletion
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="commits">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Commits Chart</CardTitle>
                                        <CardDescription>
                                            Number of commits.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer
                                            width="100%"
                                            aspect={3.0 / 1.0}
                                        >
                                            <LineChart
                                                data={getData(
                                                    this.props.commit_status,
                                                    this.props.interval,
                                                    this.props.developer,
                                                    this.props.date_range
                                                )}
                                                margin={{
                                                    top: 20,
                                                    right: 10,
                                                    left: 20,
                                                    bottom: 60,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="5 5" />
                                                <XAxis
                                                    dataKey="title"
                                                    domain={[
                                                        "dataMin",
                                                        "dataMax",
                                                    ]}
                                                    tick={
                                                        <CustomizedAxisTick />
                                                    }
                                                    label={{
                                                        value: "Dates",
                                                        style: {
                                                            textAnchor:
                                                                "middle",
                                                        },
                                                        angle: 0,
                                                        position: "bottom",
                                                        offset: 40,
                                                        fontFamily:
                                                            "sans-serif",
                                                    }}
                                                />
                                                <YAxis
                                                    orientation="left"
                                                    stroke="#222f3e"
                                                    label={{
                                                        value: "# commits",
                                                        style: {
                                                            textAnchor:
                                                                "middle",
                                                        },
                                                        angle: -90,
                                                        position: "left",
                                                        offset: 0,
                                                        fontFamily:
                                                            "sans-serif",
                                                    }}
                                                />
                                                <Tooltip />
                                                <Legend
                                                    layout="horizontal"
                                                    verticalAlign="top"
                                                    align="center"
                                                />
                                                {/* https://flatuicolors.com/palette/ca */}
                                                <Line
                                                    dataKey="num_commits"
                                                    stroke="#2e86de"
                                                />
                                                <ReferenceLine
                                                    y={averageCommits(
                                                        this.props
                                                            .commit_status,
                                                        this.props.interval,
                                                        this.props.developer,
                                                        this.props.date_range
                                                    )}
                                                    label={{
                                                        value: "",
                                                        position: "right",
                                                    }}
                                                    stroke="#2e86de"
                                                    strokeDasharray="4 4"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                    <CardFooter></CardFooter>
                                </Card>
                            </TabsContent>
                            <TabsContent value="addition&deletion">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Addition & Deletion Chart
                                        </CardTitle>
                                        <CardDescription>
                                            Number of addition and deletion
                                            lines.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer
                                            width="100%"
                                            aspect={3.0 / 1.0}
                                        >
                                            <LineChart
                                                data={getData(
                                                    this.props.commit_status,
                                                    this.props.interval,
                                                    this.props.developer,
                                                    this.props.date_range
                                                )}
                                                margin={{
                                                    top: 20,
                                                    right: 10,
                                                    left: 20,
                                                    bottom: 60,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="5 5" />
                                                <XAxis
                                                    dataKey="title"
                                                    domain={[
                                                        "dataMin",
                                                        "dataMax",
                                                    ]}
                                                    tick={
                                                        <CustomizedAxisTick />
                                                    }
                                                    label={{
                                                        value: "Dates",
                                                        style: {
                                                            textAnchor:
                                                                "middle",
                                                        },
                                                        angle: 0,
                                                        position: "bottom",
                                                        offset: 40,
                                                        fontFamily:
                                                            "sans-serif",
                                                    }}
                                                />
                                                <YAxis
                                                    orientation="left"
                                                    stroke="#222f3e"
                                                    label={{
                                                        value: "# lines",
                                                        style: {
                                                            textAnchor:
                                                                "middle",
                                                        },
                                                        angle: -90,
                                                        position: "left",
                                                        offset: 0,
                                                        fontFamily:
                                                            "sans-serif",
                                                    }}
                                                />
                                                <Tooltip />
                                                <Legend
                                                    layout="horizontal"
                                                    verticalAlign="top"
                                                    align="center"
                                                />
                                                {/* https://flatuicolors.com/palette/ca */}
                                                <Line
                                                    dataKey="num_added_lines"
                                                    stroke="#10ac84"
                                                />
                                                <Line
                                                    dataKey="num_deleted_lines"
                                                    stroke="#ee5253"
                                                />
                                                <ReferenceLine
                                                    y={averageAdditions(
                                                        this.props
                                                            .commit_status,
                                                        this.props.interval,
                                                        this.props.developer,
                                                        this.props.date_range
                                                    )}
                                                    label={{
                                                        value: "",
                                                        position: "right",
                                                    }}
                                                    stroke="#10ac84"
                                                    strokeDasharray="4 4"
                                                />
                                                <ReferenceLine
                                                    y={averageDeletions(
                                                        this.props
                                                            .commit_status,
                                                        this.props.interval,
                                                        this.props.developer,
                                                        this.props.date_range
                                                    )}
                                                    label={{
                                                        value: "",
                                                        position: "right",
                                                    }}
                                                    stroke="#ee5253"
                                                    strokeDasharray="4 4"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                    <CardFooter></CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    interval: state.lineChart.interval,
    developer: state.lineChart.developer,
    date_range: state.lineChart.date_range,
});

export default connect(mapStateToProps, {
    setInterval,
    setDeveloper,
    setDateRange,
})(LineChartView);
