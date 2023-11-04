use serde;
use serde::ser::{Serialize, SerializeStruct, Serializer};

use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::{BufRead, BufReader};

use easy_error::bail;
use regex::Regex;

type MyResult<T> = Result<T, Box<dyn Error>>;

fn is_empty_line(one_line: &String) -> bool {
    return one_line.starts_with("\r\n") || one_line.starts_with("\n");
}

fn month_name_to_number(month_name: &str) -> usize {
    match month_name.to_lowercase().as_str() {
        "jan" => 1,
        "feb" => 2,
        "mar" => 3,
        "apr" => 4,
        "may" => 5,
        "jun" => 6,
        "jul" => 7,
        "aug" => 8,
        "sep" => 9,
        "oct" => 10,
        "nov" => 11,
        "dec" => 12,
        _ => 0, // Handle invalid month names
    }
}

#[derive(Debug, PartialEq)]
pub struct CommitStatus {
    author_name: String,
    author_email: String,
    num_added_lines: usize,
    num_deleted_lines: usize,
    time_stamp: String,
    message: String,
    hash: String,
    weekday: String,
    month: usize,
    date: usize,
    year: usize,
}

#[derive(Debug, PartialEq, serde::Serialize)]
pub struct DeveloperInfos {
    number_of_commits: usize,
    email: String,
    name: String,
}

#[derive(Debug, PartialEq, serde::Serialize)]
pub struct GitLogStats {
    number_of_tatal_commits: usize,
    number_of_tatal_additions: usize,
    number_of_tatal_deletions: usize,
    developer_infos: HashMap<String, DeveloperInfos>,
}

// This is what #[derive(Serialize)] would generate.
impl Serialize for CommitStatus {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("CommitStatus", 7)?;
        s.serialize_field("author_name", &self.author_name)?;
        s.serialize_field("author_email", &self.author_email)?;
        s.serialize_field("num_added_lines", &self.num_added_lines)?;
        s.serialize_field("num_deleted_lines", &self.num_deleted_lines)?;
        s.serialize_field("time_stamp", &self.time_stamp)?;
        s.serialize_field("message", &self.message)?;
        s.serialize_field("hash", &self.hash)?;
        s.serialize_field("weekday", &self.weekday)?;
        s.serialize_field("month", &self.month)?;
        s.serialize_field("date", &self.date)?;
        s.serialize_field("year", &self.year)?;
        s.end()
    }
}

pub fn open_git_log_file(file_path: &str) -> MyResult<Box<dyn BufRead>> {
    let file = File::open(&file_path).unwrap();
    let reader = BufReader::new(file);

    return Ok(Box::new(reader));
}

pub fn parse_git_log_file(mut file: impl BufRead) -> MyResult<Vec<CommitStatus>> {
    let mut commits_status = Vec::new();

    let mut one_line = String::new();
    loop {
        if one_line.len() == 0 {
            let line_bytes = file.read_line(&mut one_line)?;
            if is_empty_line(&one_line) || line_bytes == 0 {
                break;
            }
        }

        if one_line.to_string().starts_with("commit") {
            let tokens: Vec<String> = one_line.split_whitespace().map(str::to_string).collect();
            if tokens.len() == 2 {
                let commit_hash = tokens[1].clone();
                if let Ok(status) = parse_a_commit(commit_hash, &mut one_line, &mut file) {
                    commits_status.push(status);
                }
            }
        }
    }

    Ok(commits_status)
}

// https://stackoverflow.com/questions/68021274/pass-mut-reference-to-a-function-and-get-it-back
pub fn parse_a_commit(
    commit_hash: String,
    one_line: &mut String,
    file: &mut impl BufRead,
) -> MyResult<CommitStatus> {
    let mut status: CommitStatus = CommitStatus {
        author_name: String::from(""),
        author_email: String::from(""),
        num_added_lines: 0,
        num_deleted_lines: 0,
        time_stamp: String::from(""),
        message: String::from(""),
        hash: String::from(commit_hash),
        weekday: String::from(""),
        month: 0,
        date: 0,
        year: 0,
    };

    // read author name & email
    one_line.clear();
    file.read_line(one_line)?;
    if one_line.to_string().starts_with("Merge:") {
        one_line.clear();

        let mut empty_count = 0;
        loop {
            let line_bytes = file.read_line(one_line)?;
            if is_empty_line(&one_line) || line_bytes == 0 {
                one_line.clear();
                empty_count += 1;
            }
            one_line.clear();

            if empty_count == 2 {
                bail!("Merge: Skip this commit");
            }
        }
    }

    // read author name & email
    if one_line.to_string().starts_with("Author:") {
        let re = Regex::new(r"Author:\s*(.*?)\s*<([^>]+)>")?;

        let caps = re.captures(&one_line).ok_or("Author: Regex not match")?;
        let name = caps.get(1).unwrap().as_str();
        let email = caps.get(2).unwrap().as_str();

        status.author_name = String::from(name);
        status.author_email = String::from(email);

        one_line.clear();
    }

    // read time stamp
    file.read_line(one_line)?;
    if one_line.to_string().starts_with("Date:") {
        let re = Regex::new(
            r"Date:\s+((?<weekday>[A-Za-z]{3}) (?<month>[A-Za-z]{3}) (?<date>\d{1,2}) \d{2}:\d{2}:\d{2} (?<year>\d{4}) [+-]\d{4})",
        )?;

        let caps = re.captures(&one_line).ok_or("Date: Regex not match")?;

        let weekday = caps.name("weekday").unwrap().as_str();
        let month = month_name_to_number(caps.name("month").unwrap().as_str());
        let date = caps.name("date").unwrap().as_str();
        let year = caps.name("year").unwrap().as_str();
        let date_number = date.parse::<usize>().unwrap();
        let year_number = year.parse::<usize>().unwrap();

        let time_stamp = caps.get(1).unwrap().as_str();

        status.weekday = String::from(weekday);
        status.month = month;
        status.date = date_number;
        status.year = year_number;

        status.time_stamp = String::from(time_stamp);

        one_line.clear();
    }

    // read commit message
    file.read_line(one_line)?; // skip first empty line
    one_line.clear();
    loop {
        let line_bytes = file.read_line(one_line)?;
        if is_empty_line(&one_line) || line_bytes == 0 {
            one_line.clear();
            break;
        }
        status.message.push_str(&one_line);

        one_line.clear();
    }

    // read added & deleted lines
    one_line.clear();
    loop {
        let line_bytes = file.read_line(one_line)?;
        if is_empty_line(&one_line) || line_bytes == 0 {
            one_line.clear();
            break;
        }

        if one_line.to_string().starts_with("commit ") {
            break;
        }

        let tokens: Vec<&str> = one_line.split_whitespace().collect();

        if tokens.len() == 3 {
            let added_str = tokens[0];
            let deleted_str = tokens[1];

            if let (Ok(added_int), Ok(deleted_int)) =
                (added_str.parse::<i32>(), deleted_str.parse::<i32>())
            {
                status.num_added_lines += added_int as usize;
                status.num_deleted_lines += deleted_int as usize;
            }
        }

        one_line.clear();
    }

    return Ok(status);
}

pub fn parse_commits(commits: &Vec<CommitStatus>) -> MyResult<GitLogStats> {
    let mut stats = GitLogStats {
        number_of_tatal_commits: 0,
        number_of_tatal_additions: 0,
        number_of_tatal_deletions: 0,
        developer_infos: HashMap::new(),
    };

    stats.number_of_tatal_commits = commits.len();
    for one_commit in commits.into_iter() {
        stats.number_of_tatal_additions += one_commit.num_added_lines;
        stats.number_of_tatal_deletions += one_commit.num_deleted_lines;

        let info = stats
            .developer_infos
            .entry(one_commit.author_name.clone())
            .or_insert(DeveloperInfos {
                name: one_commit.author_name.clone(),
                number_of_commits: 1,
                email: one_commit.author_email.clone(),
            });

        (*info).number_of_commits += 1;
    }

    Ok(stats)
}
