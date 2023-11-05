import React from "react";

import { Grid, Table, Button, Flex, Group } from "@mantine/core";

import { save } from "@tauri-apps/api/dialog";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";
import { stringify } from "csv-stringify/browser/esm/sync";

import {
    ColumnDef,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { CommitStatus, OneCommitStatus } from "./struct";
import { DataTable } from "./DataTable"


export const columns: ColumnDef<OneCommitStatus>[] = [
    {
        accessorKey: "author_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Author
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "author_email",
        header: "Email",
    },
    {
        accessorKey: "message",
        header: "Message",
    },
    {
        accessorKey: "time_stamp",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Time Stamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
]

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
                    <DataTable columns={columns} data={this.props.commit_status} />
                </Grid.Col>
            </Grid>
        );
    }
}
