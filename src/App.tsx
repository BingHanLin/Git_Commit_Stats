import { useState } from "react";

import { Route, Routes, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "./dashboard/components/date-range-picker";
import { RecentSales } from "./dashboard/components/recent-sales";
import { Search } from "./dashboard/components/search";
import TeamSwitcher from "./dashboard/components/team-switcher";
import { UserNav } from "./dashboard/components/user-nav";

import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

import LineChartView from "./LineChartView";
import TableView from "./TableView";
import Overview from "./Overview";

import { CommitStatus, GitLogStats } from "./struct";

function App() {
    const filters = [{ name: "Git log file", extensions: ["log"] }];

    const [activatedIndex, setActivatedIndex] = useState(0);
    const [title, setTitle] = useState("Title");
    const [commit_status, setCommitStatus] = useState([] as CommitStatus);
    const [git_log_stats, setGitLogStats] = useState({} as GitLogStats);

    const import_file = async () => {
        try {
            const file_path = await open({
                title: "Open Git Log File",
                multiple: false,
                directory: false,
                filters,
            });

            if (file_path === null) {
                console.log("canceld.");
            } else {
                if (typeof file_path === "string") {
                    setTitle("Loading...");
                    await invoke("import_git_log_file", {
                        file_path: file_path,
                    }).then((result) => {
                        let [git_log_stats, commit_status] = result as [
                            GitLogStats,
                            CommitStatus
                        ];
                        setGitLogStats(git_log_stats);
                        setCommitStatus(commit_status);
                    });
                    setTitle(file_path);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const test_state = async () => {
        try {
            invoke("my_custom_command", { value: "Hello, Async!" }).then(() =>
                console.log("Completed!")
            );
        } catch (err) {
            console.error(err);
        }

        console.log("free!");
    };

    const views: Array<{
        path: string;
        name: string;
        exact: boolean;
        component: React.ReactNode;
    }> = [
        // {
        //     path: "/",
        //     name: "Overview",
        //     exact: true,
        //     component: <Overview commit_status={commit_status} git_log_stats={git_log_stats} />
        // },
        // {
        //     path: "/LineChart",
        //     name: "Line Chart",
        //     exact: true,
        //     component: <LineChartView commit_status={commit_status} git_log_stats={git_log_stats} />
        // },
        // {
        //     path: "/TableView",
        //     name: "Table",
        //     exact: false,
        //     component: <TableView commit_status={commit_status} />
        // }
    ];

    return (
        <>
            <div className="space-y-4 p-8">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-start-1 col-end-13">
                        <div className="flex justify-between space-x-2">
                            <div className="flex flex-col">
                                <div className="text-3xl font-bold tracking-normal">
                                    Git Commit Stats
                                </div>
                                <p className="text-base text-slate-400 tracking-normal">
                                    {title}
                                </p>
                            </div>
                            <Button onClick={import_file}>Import</Button>
                        </div>
                    </div>
                    <div className="col-start-1 col-end-13">
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="overview">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="analytics">
                                    Analytics
                                </TabsTrigger>
                                <TabsTrigger value="reports">
                                    Reports
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="test" className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total Revenue
                                            </CardTitle>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                className="h-4 w-4 text-muted-foreground"
                                            >
                                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                            </svg>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                $45,231.89
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +20.1% from last month
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Subscriptions
                                            </CardTitle>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                className="h-4 w-4 text-muted-foreground"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                            </svg>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                +2350
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +180.1% from last month
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Sales
                                            </CardTitle>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                className="h-4 w-4 text-muted-foreground"
                                            >
                                                <rect
                                                    width="20"
                                                    height="14"
                                                    x="2"
                                                    y="5"
                                                    rx="2"
                                                />
                                                <path d="M2 10h20" />
                                            </svg>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                +12,234
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +19% from last month
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Active Now
                                            </CardTitle>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                className="h-4 w-4 text-muted-foreground"
                                            >
                                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                            </svg>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                +573
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +201 since last hour
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                    <Card className="col-span-4">
                                        <CardHeader>
                                            <CardTitle>Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pl-2">
                                            {/* <Overview /> */}
                                        </CardContent>
                                    </Card>
                                    <Card className="col-span-3">
                                        <CardHeader>
                                            <CardTitle>Recent Sales</CardTitle>
                                            <CardDescription>
                                                You made 265 sales this month.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <RecentSales />
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent value="overview" className="space-y-4">
                                <Overview
                                    commit_status={commit_status}
                                    git_log_stats={git_log_stats}
                                />
                            </TabsContent>
                            <TabsContent
                                value="analytics"
                                className="space-y-4"
                            >
                                <LineChartView
                                    commit_status={commit_status}
                                    git_log_stats={git_log_stats}
                                />
                            </TabsContent>
                            <TabsContent value="reports" className="space-y-4">
                                <TableView commit_status={commit_status} />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}

export default App;
