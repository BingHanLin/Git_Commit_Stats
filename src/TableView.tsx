import React from 'react';

import { Grid, Table } from '@mantine/core';

import { CommitStatus } from "./struct.tsx";

interface ITableViewProp {
  infos: CommitStatus;
}

export default class TableView extends React.Component<ITableViewProp, {}> {

  constructor(props: ITableViewProp) {
    super(props);
  }

  public render() {
    const rows = this.props.infos.map((info) => (
      <tr key={info.time_stamp}>
        <td>{info.author_name}</td>
        <td>{info.num_added_lines}</td>
        <td>{info.num_deleted_lines}</td>
        <td>{info.message}</td>
        <td>{info.time_stamp}</td>
        <td>{info.month}</td>
      </tr>
    ));

    return (
      <Grid>
        <Grid.Col span={12}>
          <Table highlightOnHover withColumnBorders>
            <thead>
              <tr>
                <th>Author</th>
                <th>Added Lines</th>
                <th>Deleted Lines</th>
                <th>Message</th>
                <th>Time Stamp</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Grid.Col>
      </Grid >);
  }
}