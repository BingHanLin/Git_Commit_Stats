import React from 'react';

import { Grid, Card, Text, Group, Stack } from '@mantine/core';

import { CommitStatus, GitLogStats, DeveloperInfos } from './struct';

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  YAxis,
  Legend
} from 'recharts';

type ResultObject = {
  [key: string]: any;
};

function getData(data: CommitStatus, developers: Map<string, DeveloperInfos>): ResultObject[] {
  if (developers) {
    const result = data.reduce<ResultObject[]>((accumulator, currentObject) => {
      const author = currentObject.author_name;
      const year = currentObject.year;
      const month = currentObject.month;

      const existingObject = accumulator.find(entry => entry['year'] === currentObject.year && entry['month'] === currentObject.month);

      if (existingObject !== undefined) {
        // If an entry already exists for the date, update the author's value
        if (existingObject[author] !== undefined/*&& typeof existingObject[author] === "number"*/) {
          existingObject[author] += 1;
        }
      } else {
        const newObject: {
          [key: string]: any;
        } = { year: year, month: month, title: year.toString() + "-" + month.toString() };

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
    }, []);


    const sortedArray = Array.from(result);
    sortedArray.sort((a, b) => (a.year - b.year) * 12 + (a.month - b.month));

    return sortedArray;
  }

  return [];
}


function sortedTop5Developers(data: Map<string, DeveloperInfos>): DeveloperInfos[] {
  if (data) {
    const sortedArray = Array.from(Object.values(data));
    sortedArray.sort((a: DeveloperInfos, b: DeveloperInfos) => b.number_of_commits - a.number_of_commits);

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

interface IOverviewProp {
  commit_status: CommitStatus;
  git_log_stats: GitLogStats;
}

export default class Overview extends React.Component<IOverviewProp> {

  constructor(props: IOverviewProp) {
    super(props);


  }

  componentWillUnmount() {

    console.log('Overview WILL UNMOUNT!');
  }

  componentDidUpdate(prevProps: IOverviewProp) {
    console.log('Overview  componentDidUpdate!');
    // console.log(this.props.git_log_stats.developer_infos)
    // let v = this.props.git_log_stats.developer_infos as Map<string, DeveloperInfos>;
  }

  public render() {
    return (
      <Grid align="stretch" columns={12}>
        <Grid.Col span={3} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Total Commits</Text>
            </Group>
            <Group mt="md" spacing="xs">
              <Text size="lg">
                {this.props.git_log_stats.number_of_tatal_commits ? this.props.git_log_stats.number_of_tatal_commits.toLocaleString() : "--"}
              </Text>
              <Text size="sm" c="dimmed">
                commits.
              </Text>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Developers</Text>
            </Group>
            <Group mt="md" spacing="xs">
              <Text size="lg">
                {this.props.git_log_stats.developer_infos ?
                  Object.keys(this.props.git_log_stats.developer_infos).length.toLocaleString() : "--"}
              </Text>
              <Text size="sm" c="dimmed">
                developers.
              </Text>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Additions</Text>
            </Group>

            <Group mt="md" spacing="xs">
              <Text size="lg">
                {this.props.git_log_stats.number_of_tatal_additions ? this.props.git_log_stats.number_of_tatal_additions.toLocaleString() : "--"}
              </Text>
              <Text size="sm" c="dimmed">
                lines added,
              </Text>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={3} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Deletions</Text>
            </Group>
            <Group mt="md" spacing="xs">
              <Text size="lg">
                {this.props.git_log_stats.number_of_tatal_deletions ? this.props.git_log_stats.number_of_tatal_deletions.toLocaleString() : "--"}
              </Text>
              <Text size="sm" c="dimmed">
                lines deleted.
              </Text>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={9} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Commits Overview</Text>
            </Group>
            <ResponsiveContainer width="100%" minHeight={400}>
              <BarChart
                data={getData(this.props.commit_status, this.props.git_log_stats.developer_infos)}
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
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {
                  this.props.git_log_stats.developer_infos && Object.keys(this.props.git_log_stats.developer_infos).map((author, index) => {

                    let color_index = index;
                    while (color_index >= color_array.length) {
                      color_index -= color_array.length;
                    }

                    return (
                      <Bar key={author} dataKey={author} stackId="a" fill={color_array[color_index]} />
                    );
                  })
                }
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid.Col>

        <Grid.Col span={3} >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mt="md" mb="xs">
              <Text fw={500}>Top 5 Developers</Text>
            </Group>
            <Stack>
              {
                sortedTop5Developers(this.props.git_log_stats.developer_infos).map((info) => {
                  return (
                    <Stack key={info.name} spacing="xm">
                      <Group >
                        <Text fw={500}>{info.name}</Text>
                        <Text fw={500} c="dimmed">{info.number_of_commits.toLocaleString()} commits</Text>
                      </Group>
                      <Text size="sm" c="dimmed">
                        {info.email}
                      </Text>
                    </Stack>
                  );
                })
              }
            </Stack>
          </Card>
        </Grid.Col>
      </Grid >
    );
  }

}

