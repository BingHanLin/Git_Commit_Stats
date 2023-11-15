import React from "react";

import { Button } from "@/components/ui/button";

import { save } from "@tauri-apps/api/dialog";
import { writeTextFile } from "@tauri-apps/api/fs";
import { stringify } from "csv-stringify/browser/esm/sync";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { CommitStatus, OneCommitStatus } from "./struct";
import { DataTable } from "./DataTable";

export const columns: ColumnDef<OneCommitStatus>[] = [
    {
        accessorKey: "author_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Author
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: "Author",
    },
    {
        accessorKey: "author_email",
        header: "Email",
        meta: "Email",
    },
    {
        accessorKey: "message",
        header: "Message",
        meta: "Message",
    },
    {
        accessorKey: "time_stamp",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Time Stamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: "Time Stamp",
    },
];

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
                    const output = stringify(this.props.commit_status, {
                        header: true,
                    });
                    await writeTextFile(file_path, output, { append: false });
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    public render() {
        return <DataTable columns={columns} data={this.props.commit_status} />;
    }
}
