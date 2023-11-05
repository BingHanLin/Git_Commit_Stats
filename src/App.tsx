import { useState, React } from "react";

import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import reactLogo from "./assets/react.svg";

import {
    AppShell,
    Navbar,
    Header,
    Footer,
    Text,
    MantineProvider,
    Button,
    NavLink,
    Grid,
    Flex
} from "@mantine/core";

import { createStyles, useMantineTheme } from "@mantine/styles";

import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { readBinaryFile } from "@tauri-apps/api/fs";

import "./App.css";

import LineChartView from "./LineChartView";
import TableView from "./TableView";
import Overview from "./Overview";

import { CommitStatus, GitLogStats } from "./struct.tsx";

function App() {
    const theme = useMantineTheme();

    const navigate = useNavigate();

    const filters = [
        { name: "Git log file", extensions: ["log"] },
    ];

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
                filters
            });

            if (file_path === null) {
                console.log("canceld.");
            }
            else {
                if (typeof file_path === "string") {
                    setTitle("Loading...");
                    await invoke('import_git_log_file', { file_path: file_path }).then((result) => {
                        let [git_log_stats, commit_status] = result as [GitLogStats, CommitStatus];
                        setGitLogStats(git_log_stats);
                        setCommitStatus(commit_status);
                    });
                    setTitle(file_path);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    const test_state = async () => {
        try {

            invoke('my_custom_command', { value: 'Hello, Async!' }).then(() =>
                console.log('Completed!')
            )

        } catch (err) {
            console.error(err);
        }

        console.log('free!')
    }

    const views: Array<{ path: string, name: string, exact: boolean, component: React.Component }> = [
        {
            path: "/",
            name: "Overview",
            exact: true,
            component: <Overview commit_status={commit_status} git_log_stats={git_log_stats} />
        },
        {
            path: "/LineChart",
            name: "Line Chart",
            exact: true,
            component: <LineChartView commit_status={commit_status} git_log_stats={git_log_stats} />
        },
        {
            path: "/TableView",
            name: "Table",
            exact: false,
            component: <TableView commit_status={commit_status} />
        }
    ]

    return (
        <MantineProvider>
            <AppShell
                styles={{
                    root: {
                        background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                navbar={
                    <Navbar p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
                        {
                            views.map((view, index) => {
                                return (
                                    <NavLink
                                        key={index}
                                        active={index === activatedIndex}
                                        label={view.name}
                                        variant="light"
                                        onClick={() => {
                                            navigate(view.path, { replace: true });
                                            setActivatedIndex(index);
                                        }}
                                    >
                                    </NavLink>
                                );
                            })
                        }
                    </Navbar>
                }
                header={
                    < Header height={{ sm: 70 }} p="md" background-color="#2e86de" >
                        <Grid justify="space-between" align="center">
                            <Grid.Col span={8}>
                                <Text>Git Commit Stats - {title}</Text>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Flex
                                    mih={50}
                                    gap="xl"
                                    justify="flex-end"
                                    align="center"
                                    direction="row"
                                    wrap="wrap"
                                >
                                    <Button variant="default" onClick={test_state}>Test State</Button>
                                    <Button variant="default" onClick={import_file}>Import</Button>
                                </Flex>
                            </Grid.Col>

                        </Grid >
                    </Header >
                }
                footer={
                    < Footer height={60} p="md" >
                        Application footer
                    </Footer >
                }
            >
                <Routes>
                    {
                        views.map((view, id) => {
                            return (<Route key={id} path={view.path} element={view.component} />
                            );
                        })
                    }
                </Routes>
            </AppShell >
        </MantineProvider >
    );
}

export default App;
