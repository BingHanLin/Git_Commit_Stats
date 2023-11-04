import React from "react";

import { useSelector, useDispatch } from "react-redux";
import {
    setInterval,
    setDeveloper,
    setDevelopers,
    setFilteredInfos,
} from "./slice";
import type { RootState } from "./store";
import { connect } from "react-redux";

import { Grid, Select, Flex, Group } from "@mantine/core";
import { DatePickerInput } from '@mantine/dates';

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

function dateFormatter(date: number): string {
    let date_obj = new Date(date);

    let result: string = `${date_obj.getFullYear()}-${date_obj.getMonth()}`;

    return result;
}

function getXDataKey(data: OneCommitStatus): number {
    return new Date(data.year, data.month, data.date).getTime();
}

function getData(data: CommitStatus, interval: string, developer: string): [] {
    const filteredData = data.filter((item) => item.author_name === developer);

    const reducedData = filteredData.reduce((accumulator, currentObject) => {
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
    }, []);

    reducedData.sort(
        (a, b) =>
            new Date(a.year, a.month, a.date).getTime() -
            new Date(b.year, b.month, b.date).getTime()
    );

    return reducedData;
}

interface ILineChartViewProp {
    commit_status: CommitStatus;
    git_log_stats: GitLogStats;
    interval: string;
    developer: string;
    setInterval: (val: string) => void;
    setDeveloper: (val: string) => void;
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
        console.log(this.props.developer);
        console.log(this.props.interval);
        console.log("componentDidUpdate!......");

        // if (
        //     prevProps.commit_status !== this.props.commit_status ||
        //     prevProps.git_log_stats !== this.props.git_log_stats
        // ) {
        //     //TODO improve
        //     this.parse_data();
        // } else if (
        //     prevProps.developer !== this.props.developer ||
        //     prevProps.interval !== this.props.interval
        // ) {
        //     this.process_data();
        // }
    }

    public render() {
        return (
            <Grid>
                <Grid.Col span={12}>
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
                                data={this.props.git_log_stats.developer_infos ?
                                    Object.keys(this.props.git_log_stats.developer_infos) : []}
                                value={this.props.developer}
                                onChange={(event) => {
                                    if (typeof event == "string") {
                                        this.props.setDeveloper(event);
                                    }
                                }}
                            />
                            <DatePickerInput
                                type="range"
                                label="Pick dates range"
                                placeholder="Pick dates range"
                                value={0}
                                // onChange={setValue}
                                mx="auto"
                            />
                        </Group>
                    </Flex>
                </Grid.Col>

                <Grid.Col span={12}>
                    <ResponsiveContainer width="100%" minHeight={300}>
                        <LineChart
                            width={500}
                            height={300}
                            data={getData(
                                this.props.commit_status,
                                this.props.interval,
                                this.props.developer
                            )}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="5 5" />
                            <XAxis
                                dataKey="title"
                                domain={["dataMin", "dataMax"]}
                            />
                            <YAxis orientation="left" stroke="#222f3e" label={{
                                value: `# lines`,
                                style: { textAnchor: 'middle' },
                                angle: -90,
                                position: 'left',
                                offset: 0,
                                fontFamily: 'sans-serif'
                            }} />
                            <Tooltip />
                            <Legend />
                            {/* https://flatuicolors.com/palette/ca */}
                            <Line dataKey="num_deleted_lines" stroke="#ee5253" />
                            <Line dataKey="num_added_lines" stroke="#10ac84" />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid.Col>
                <Grid.Col span={12}>
                    <ResponsiveContainer width="100%" minHeight={300}>
                        <LineChart
                            width={500}
                            height={300}
                            data={getData(
                                this.props.commit_status,
                                this.props.interval,
                                this.props.developer
                            )}
                            margin={{
                                top: 5,
                                right: 10,
                                left: 10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="5 5" />
                            <XAxis
                                dataKey="title"
                                domain={["dataMin", "dataMax"]}
                            />
                            <YAxis orientation="left" stroke="#222f3e" label={{
                                value: `# commits`,
                                style: { textAnchor: 'middle' },
                                angle: -90,
                                position: 'left',
                                offset: 0,
                                fontFamily: 'sans-serif'
                            }} />
                            <Tooltip />
                            <Legend />
                            {/* https://flatuicolors.com/palette/ca */}
                            <Line dataKey="num_commits" stroke="#2e86de" />
                        </LineChart>
                    </ResponsiveContainer>
                </Grid.Col>
            </Grid>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    interval: state.lineChart.interval,
    developer: state.lineChart.developer,
});

export default connect(mapStateToProps, {
    setInterval,
    setDeveloper,
})(LineChartView);
