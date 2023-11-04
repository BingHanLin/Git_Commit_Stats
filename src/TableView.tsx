import React from "react";

import { Grid, Table, Button, Flex, Group } from "@mantine/core";

import { save } from "@tauri-apps/api/dialog";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { stringify } from "csv-stringify/browser/esm/sync";

import { CommitStatus } from "./struct";

interface ITableViewProp {
    commit_status: CommitStatus;
}

export default class TableView extends React.Component<ITableViewProp, {}> {
    constructor(props: ITableViewProp) {
        super(props);

        this.export_file = this.export_file.bind(this);
    }

    async export_file() {
        console.log("export_file.");
        try {
            const file_path = await save({
                title: "Export CSV",
                filters: [
                    {
                        name: "CSV",
                        extensions: ["csv"],
                    },
                ],
            });

            if (file_path === null) {
                console.log("canceld.");
            } else {
                if (typeof file_path === "string") {
                    const output = stringify(this.props.commit_status, { header: true });
                    await writeTextFile(file_path, output, { append: false });
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    public render() {
        console.log("render.");
        console.log(this.props.commit_status);

        const rows = this.props.commit_status.map((status) => (
            <tr key={status.time_stamp}>
                <td>{status.author_name}</td>
                <td>{status.num_added_lines}</td>
                <td>{status.num_deleted_lines}</td>
                <td>{status.message}</td>
                <td>{status.time_stamp}</td>
                <td>{status.month}</td>
            </tr>
        ));

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
                            <Button
                                fullWidth
                                variant="default"
                                color="#F0BBDD"
                                onClick={this.export_file}
                            >
                                Export CSV
                            </Button>
                        </Group>
                    </Flex>
                </Grid.Col>

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
            </Grid>
        );
    }
}
