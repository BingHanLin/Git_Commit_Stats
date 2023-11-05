import React from "react";

import { useSelector, useDispatch } from "react-redux";

import { setInterval, setDeveloper, setDateRange } from "./slice";

import type { RootState } from "./store";
import { connect } from "react-redux";

import {
    Tabs,
    Text,
    Grid,
    Select,
    Flex,
    Card,
    Group,
    Stack,
} from "@mantine/core";
import { DatePickerInput, DatesRangeValue } from "@mantine/dates";

import {
    LineChart,
    XAxis,
    Tooltip,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    YAxis,
    Legend,
} from "recharts";

import { OneCommitStatus, CommitStatus, GitLogStats } from "./struct";

function convertIntoDate(
    date_range: [number | null, number | null]
): [Date | null, Date | null] {
    if (date_range) {
        if (date_range[0] === null && date_range[0] === null) {
            // let date1 = new Date();
            // date1.setMonth(date1.getMonth() - 6);
            // if (date_range[0] !== null) {
            //     date1.setTime(date_range[0]);
            // }

            // let date2 = new Date();
            // if (date_range[1] !== null) {
            //     date2.setTime(date_range[1]);
            // }
            // return [date1, date2];
        }
        else {
            let date1 = null;
            if (date_range[0] !== null) {
                date1 = new Date();
                date1.setTime(date_range[0]);
            }

            let date2 = null;
            if (date_range[1] !== null) {
                date2 = new Date();
                date2.setTime(date_range[1]);
            }
            return [date1, date2];
        }
    }

    return [null, null];
}

function getData(
    data: CommitStatus,
    interval: string,
    developer: string,
    date_range: [number | null, number | null]
): [] {
    const authorFilteredData = data.filter(
        (item) => item.author_name === developer
    );

    const dateRnageFilteredData = authorFilteredData.filter((item) => {
        // January is month 0. December is month 11.
        const item_date = new Date(item.year, item.month - 1, item.date).getTime();

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

    const reducedData = dateRnageFilteredData.reduce(
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
                    existingObject["num_added_lines"] += currentObject.num_added_lines;
                    existingObject["num_deleted_lines"] += currentObject.num_deleted_lines;
                    existingObject["num_commits"] += 1;
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
                    existingObject["num_added_lines"] += currentObject.num_added_lines;
                    existingObject["num_deleted_lines"] += currentObject.num_deleted_lines;
                    existingObject["num_commits"] += 1;
                } else {
                    const newObject = {
                        year: year,
                        month: month,
                        date: date,
                        title: year.toString() + "-" + month.toString() + "-" + date.toString(),
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

class LineChartView extends React.Component<ILineChartViewProp> {
    constructor(props: ILineChartViewProp) {
        super(props);
    }

    componentWillUnmount() {
        console.log("LineChartView WILL UNMOUNT!");
    }

    componentDidUpdate(prevProps: ILineChartViewProp) {
        console.log("componentDidUpdate!");
    }

    public render() {
        return (
            <Grid align="stretch" columns={12}>
                <Grid.Col span={12}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack>

                            <Flex
                                mih={50}
                                gap="xl"
                                justify="flex-end"
                                align="center"
                                direction="row"
                                wrap="wrap"
                            >
                                <Group>
                                    <Select
                                        label="Interval"
                                        placeholder="Pick one"
                                        data={[
                                            { value: "month", label: "Month" },
                                            { value: "date", label: "Date" },
                                        ]}
                                        value={this.props.interval}
                                        onChange={(event) => {
                                            if (typeof event == "string") {
                                                this.props.setInterval(event);
                                            }
                                        }}
                                    />
                                    <Select
                                        label="Developer"
                                        placeholder="Pick one"
                                        data={
                                            this.props.git_log_stats.developer_infos
                                                ? Object.keys(this.props.git_log_stats.developer_infos)
                                                : []
                                        }
                                        value={this.props.developer}
                                        onChange={(event) => {
                                            if (typeof event == "string") {
                                                this.props.setDeveloper(event);
                                            }
                                        }}
                                    />
                                    <DatePickerInput
                                        styles={{
                                            wrapper: {
                                                background: 'white',
                                            },
                                        }}
                                        type="range"
                                        label="Pick dates range"
                                        placeholder="Pick dates range"
                                        value={convertIntoDate(this.props.date_range)}
                                        onChange={(event) => {
                                            let date_range: [number | null, number | null] = [null, null];

                                            if (event[0] !== null) {
                                                date_range[0] = event[0].getTime();
                                            } else {
                                                date_range[0] = null;
                                            }

                                            if (event[1] !== null) {
                                                date_range[1] = event[1].getTime();
                                            } else {
                                                date_range[1] = null;
                                            }

                                            this.props.setDateRange(date_range);
                                        }}
                                        mx="auto"
                                    />
                                </Group>
                            </Flex>

                            <Tabs defaultValue="commits">
                                <Tabs.List>
                                    <Tabs.Tab value="commits">Commits Graph</Tabs.Tab>
                                    <Tabs.Tab value="additions&deletions">
                                        Additions & Deletions Graph
                                    </Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="commits" pt="xs">
                                    <ResponsiveContainer width="100%" minHeight={450}>
                                        <LineChart
                                            width={500}
                                            height={300}
                                            data={getData(
                                                this.props.commit_status,
                                                this.props.interval,
                                                this.props.developer,
                                                this.props.date_range
                                            )}
                                            margin={{
                                                top: 20,
                                                right: 10,
                                                left: 10,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="5 5" />
                                            <XAxis dataKey="title" domain={["dataMin", "dataMax"]}
                                                label={{
                                                    value: `Dates`,
                                                    style: { textAnchor: "middle" },
                                                    angle: 0,
                                                    position: "bottom",
                                                    offset: 0,
                                                    fontFamily: "sans-serif",
                                                }} />
                                            <YAxis
                                                orientation="left"
                                                stroke="#222f3e"
                                                label={{
                                                    value: `# commits`,
                                                    style: { textAnchor: "middle" },
                                                    angle: -90,
                                                    position: "left",
                                                    offset: 0,
                                                    fontFamily: "sans-serif",
                                                }}
                                            />
                                            <Tooltip />
                                            <Legend layout="horizontal" verticalAlign="top" align="center" />
                                            {/* https://flatuicolors.com/palette/ca */}
                                            <Line dataKey="num_commits" stroke="#2e86de" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Tabs.Panel>

                                <Tabs.Panel value="additions&deletions" pt="xs">
                                    <Grid align="stretch" columns={12}>
                                        <Grid.Col span={12}>
                                            <ResponsiveContainer width="100%" minHeight={450}>
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
                                                        left: 10,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="5 5" />
                                                    <XAxis dataKey="title" domain={["dataMin", "dataMax"]}
                                                        label={{
                                                            value: `Dates`,
                                                            style: { textAnchor: "middle" },
                                                            angle: 0,
                                                            position: "bottom",
                                                            offset: 0,
                                                            fontFamily: "sans-serif",
                                                        }}
                                                    />
                                                    <YAxis
                                                        orientation="left"
                                                        stroke="#222f3e"
                                                        label={{
                                                            value: `# lines`,
                                                            style: { textAnchor: "middle" },
                                                            angle: -90,
                                                            position: "left",
                                                            offset: 0,
                                                            fontFamily: "sans-serif",
                                                        }}
                                                    />
                                                    <Tooltip />
                                                    <Legend layout="horizontal" verticalAlign="top" align="center" />
                                                    {/* https://flatuicolors.com/palette/ca */}
                                                    <Line dataKey="num_deleted_lines" stroke="#ee5253" />
                                                    <Line dataKey="num_added_lines" stroke="#10ac84" />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Grid.Col>
                                    </Grid>
                                </Tabs.Panel>

                            </Tabs>

                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid >
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
